-- ============================================================================
-- Cyntra C+D Event Sourcing Model
-- ============================================================================

create extension if not exists pgcrypto;
create schema if not exists cd;

-- --------------------------------------------------------------------------
-- Event store
-- --------------------------------------------------------------------------

create table if not exists cd.event_store (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  version integer not null,
  correlation_id text,
  causation_id text,
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  constraint chk_event_version_positive check (version > 0),
  constraint uq_event_store_aggregate_version unique (aggregate_type, aggregate_id, version)
);

create index if not exists idx_event_store_aggregate_created
  on cd.event_store (aggregate_type, aggregate_id, created_at asc);

create index if not exists idx_event_store_event_type_created
  on cd.event_store (event_type, created_at desc);

create index if not exists idx_event_store_payload_gin
  on cd.event_store using gin (payload);

-- --------------------------------------------------------------------------
-- Projections
-- --------------------------------------------------------------------------

create table if not exists cd.decision_cycle_projection (
  decision_cycle_id uuid primary key,
  organization_id uuid not null,
  cycle_key text,
  title text,
  scope text,
  cycle_status text,
  latest_analysis_status text,
  analysis_started_count integer not null default 0,
  analysis_completed_count integer not null default 0,
  analysis_failed_count integer not null default 0,
  dominant_decision_outcome text,
  dominant_decision_statement text,
  intervention_open_count integer not null default 0,
  intervention_completed_count integer not null default 0,
  last_event_version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cd.governance_projection (
  decision_cycle_id uuid primary key,
  organization_id uuid not null,
  conflict_count integer not null default 0,
  execution_speed numeric(10,4) not null default 0,
  intervention_completion_rate numeric(10,4) not null default 0,
  decision_latency numeric(10,4) not null default 0,
  governance_discipline numeric(10,4) not null default 0,
  last_event_version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cd.dsi_projection (
  decision_cycle_id uuid primary key,
  organization_id uuid not null,
  dsi numeric(10,4) not null default 0,
  conflict_count integer not null default 0,
  execution_speed numeric(10,4) not null default 0,
  intervention_completion_rate numeric(10,4) not null default 0,
  decision_latency numeric(10,4) not null default 0,
  governance_discipline numeric(10,4) not null default 0,
  last_event_version integer not null default 0,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cd.projector_checkpoint (
  projector_name text primary key,
  last_event_id uuid,
  last_event_created_at timestamptz,
  last_event_version integer,
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Helpers
-- --------------------------------------------------------------------------

create or replace function cd.calculate_dsi_projection(
  p_conflict_count integer,
  p_execution_speed numeric,
  p_intervention_completion_rate numeric,
  p_decision_latency numeric,
  p_governance_discipline numeric
)
returns numeric
language sql
immutable
as $$
  with factors as (
    select
      greatest(0::numeric, least(100::numeric, (100 - coalesce(p_conflict_count, 0) * 8))) as conflict_score,
      greatest(0::numeric, least(100::numeric, coalesce(p_execution_speed, 0))) as execution_score,
      greatest(0::numeric, least(100::numeric, coalesce(p_intervention_completion_rate, 0))) as intervention_score,
      greatest(0::numeric, least(100::numeric, (100 - coalesce(p_decision_latency, 0) * 1.25))) as latency_score,
      greatest(0::numeric, least(100::numeric, coalesce(p_governance_discipline, 0))) as governance_score
  )
  select round(
    (conflict_score * 0.25) +
    (execution_score * 0.20) +
    (intervention_score * 0.20) +
    (latency_score * 0.15) +
    (governance_score * 0.20),
    4
  )
  from factors;
$$;

create or replace function cd.append_event(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb,
  p_created_by text default 'system',
  p_correlation_id text default null,
  p_causation_id text default null
)
returns cd.event_store
language plpgsql
as $$
declare
  v_version integer;
  v_event cd.event_store;
  v_lock_key bigint;
begin
  v_lock_key := hashtextextended(concat_ws(':', p_aggregate_type, p_aggregate_id::text), 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(max(version), 0) + 1
  into v_version
  from cd.event_store
  where aggregate_type = p_aggregate_type
    and aggregate_id = p_aggregate_id;

  insert into cd.event_store (
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    version,
    correlation_id,
    causation_id,
    created_by,
    created_at
  ) values (
    p_aggregate_type,
    p_aggregate_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    v_version,
    p_correlation_id,
    p_causation_id,
    coalesce(p_created_by, 'system'),
    now()
  )
  returning * into v_event;

  return v_event;
end;
$$;

create or replace function cd.project_event_row(p_event cd.event_store)
returns void
language plpgsql
as $$
declare
  v_org_id uuid;
  v_intervention_open integer;
  v_intervention_completed integer;
  v_conflict_count integer;
  v_execution_speed numeric(10,4);
  v_intervention_completion_rate numeric(10,4);
  v_decision_latency numeric(10,4);
  v_governance_discipline numeric(10,4);
  v_dsi numeric(10,4);
begin
  v_org_id := coalesce((p_event.payload ->> 'organization_id')::uuid, null);

  if p_event.event_type = 'decision_cycle_created' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      cycle_key,
      title,
      scope,
      cycle_status,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      p_event.payload ->> 'cycle_key',
      p_event.payload ->> 'title',
      p_event.payload ->> 'scope',
      p_event.payload ->> 'status',
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      cycle_key = excluded.cycle_key,
      title = excluded.title,
      scope = excluded.scope,
      cycle_status = excluded.cycle_status,
      last_event_version = excluded.last_event_version,
      updated_at = now();

    insert into cd.governance_projection (
      decision_cycle_id,
      organization_id,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      last_event_version = excluded.last_event_version,
      updated_at = now();

    insert into cd.dsi_projection (
      decision_cycle_id,
      organization_id,
      last_event_version,
      calculated_at,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      p_event.version,
      now(),
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'analysis_started' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      latest_analysis_status,
      analysis_started_count,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      'running',
      1,
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      latest_analysis_status = 'running',
      analysis_started_count = cd.decision_cycle_projection.analysis_started_count + 1,
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'analysis_completed' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      latest_analysis_status,
      analysis_completed_count,
      cycle_status,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      'done',
      1,
      coalesce(p_event.payload ->> 'cycle_status', 'decision_pending'),
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      latest_analysis_status = 'done',
      analysis_completed_count = cd.decision_cycle_projection.analysis_completed_count + 1,
      cycle_status = coalesce(p_event.payload ->> 'cycle_status', cd.decision_cycle_projection.cycle_status),
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'analysis_failed' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      latest_analysis_status,
      analysis_failed_count,
      cycle_status,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      'failed',
      1,
      coalesce(p_event.payload ->> 'cycle_status', 'failed'),
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      latest_analysis_status = 'failed',
      analysis_failed_count = cd.decision_cycle_projection.analysis_failed_count + 1,
      cycle_status = coalesce(p_event.payload ->> 'cycle_status', cd.decision_cycle_projection.cycle_status),
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'decision_committed' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      dominant_decision_outcome,
      dominant_decision_statement,
      cycle_status,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      p_event.payload ->> 'outcome',
      p_event.payload ->> 'decision_statement',
      coalesce(p_event.payload ->> 'cycle_status', 'decision_registered'),
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      dominant_decision_outcome = excluded.dominant_decision_outcome,
      dominant_decision_statement = excluded.dominant_decision_statement,
      cycle_status = excluded.cycle_status,
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'intervention_created' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      intervention_open_count,
      cycle_status,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      1,
      'intervention_active',
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      intervention_open_count = cd.decision_cycle_projection.intervention_open_count + 1,
      cycle_status = 'intervention_active',
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'intervention_completed' then
    insert into cd.decision_cycle_projection (
      decision_cycle_id,
      organization_id,
      intervention_completed_count,
      intervention_open_count,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      1,
      0,
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      intervention_completed_count = cd.decision_cycle_projection.intervention_completed_count + 1,
      intervention_open_count = greatest(cd.decision_cycle_projection.intervention_open_count - 1, 0),
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'governance_metric_updated' then
    insert into cd.governance_projection (
      decision_cycle_id,
      organization_id,
      conflict_count,
      execution_speed,
      governance_discipline,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      case when p_event.payload ->> 'metric_code' in ('conflict_count', 'conflict_recurrence') then coalesce((p_event.payload ->> 'observed_value')::int, 0) else 0 end,
      case when p_event.payload ->> 'metric_code' in ('execution_speed', 'decision_velocity') then coalesce((p_event.payload ->> 'observed_value')::numeric, 0) else 0 end,
      case when p_event.payload ->> 'metric_code' in ('governance_discipline', 'gate_score', 'stakeholder_alignment') then coalesce((p_event.payload ->> 'observed_value')::numeric, 0) else 0 end,
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      conflict_count = case
        when p_event.payload ->> 'metric_code' in ('conflict_count', 'conflict_recurrence')
          then coalesce((p_event.payload ->> 'observed_value')::int, cd.governance_projection.conflict_count)
        else cd.governance_projection.conflict_count
      end,
      execution_speed = case
        when p_event.payload ->> 'metric_code' in ('execution_speed', 'decision_velocity')
          then coalesce((p_event.payload ->> 'observed_value')::numeric, cd.governance_projection.execution_speed)
        else cd.governance_projection.execution_speed
      end,
      governance_discipline = case
        when p_event.payload ->> 'metric_code' in ('governance_discipline', 'gate_score', 'stakeholder_alignment')
          then coalesce((p_event.payload ->> 'observed_value')::numeric, cd.governance_projection.governance_discipline)
        else cd.governance_projection.governance_discipline
      end,
      last_event_version = excluded.last_event_version,
      updated_at = now();

  elsif p_event.event_type = 'DSI_recalculated' then
    null;
  end if;

  -- Recompute derived governance + DSI projections when relevant.
  if p_event.event_type in (
    'decision_cycle_created',
    'analysis_completed',
    'decision_committed',
    'intervention_created',
    'intervention_completed',
    'governance_metric_updated',
    'DSI_recalculated'
  ) then
    select
      coalesce(dcp.intervention_open_count, 0),
      coalesce(dcp.intervention_completed_count, 0)
    into
      v_intervention_open,
      v_intervention_completed
    from cd.decision_cycle_projection dcp
    where dcp.decision_cycle_id = p_event.aggregate_id;

    select
      coalesce(gp.conflict_count, 0),
      coalesce(gp.execution_speed, 0),
      coalesce(gp.decision_latency, 0),
      coalesce(gp.governance_discipline, 0)
    into
      v_conflict_count,
      v_execution_speed,
      v_decision_latency,
      v_governance_discipline
    from cd.governance_projection gp
    where gp.decision_cycle_id = p_event.aggregate_id;

    v_intervention_completion_rate := case
      when coalesce(v_intervention_open, 0) + coalesce(v_intervention_completed, 0) = 0 then 0
      else round(
        (coalesce(v_intervention_completed, 0)::numeric /
          (coalesce(v_intervention_open, 0) + coalesce(v_intervention_completed, 0))::numeric) * 100,
        4
      )
    end;

    insert into cd.governance_projection (
      decision_cycle_id,
      organization_id,
      conflict_count,
      execution_speed,
      intervention_completion_rate,
      decision_latency,
      governance_discipline,
      last_event_version,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      coalesce(v_conflict_count, 0),
      coalesce(v_execution_speed, 0),
      coalesce(v_intervention_completion_rate, 0),
      coalesce(v_decision_latency, 0),
      coalesce(v_governance_discipline, 0),
      p_event.version,
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      conflict_count = excluded.conflict_count,
      execution_speed = excluded.execution_speed,
      intervention_completion_rate = excluded.intervention_completion_rate,
      decision_latency = excluded.decision_latency,
      governance_discipline = excluded.governance_discipline,
      last_event_version = excluded.last_event_version,
      updated_at = now();

    v_dsi := cd.calculate_dsi_projection(
      coalesce(v_conflict_count, 0),
      coalesce(v_execution_speed, 0),
      coalesce(v_intervention_completion_rate, 0),
      coalesce(v_decision_latency, 0),
      coalesce(v_governance_discipline, 0)
    );

    insert into cd.dsi_projection (
      decision_cycle_id,
      organization_id,
      dsi,
      conflict_count,
      execution_speed,
      intervention_completion_rate,
      decision_latency,
      governance_discipline,
      last_event_version,
      calculated_at,
      created_at,
      updated_at
    ) values (
      p_event.aggregate_id,
      coalesce(v_org_id, (select organization_id from cd.decision_cycle where id = p_event.aggregate_id)),
      v_dsi,
      coalesce(v_conflict_count, 0),
      coalesce(v_execution_speed, 0),
      coalesce(v_intervention_completion_rate, 0),
      coalesce(v_decision_latency, 0),
      coalesce(v_governance_discipline, 0),
      p_event.version,
      now(),
      now(),
      now()
    )
    on conflict (decision_cycle_id) do update
    set
      dsi = excluded.dsi,
      conflict_count = excluded.conflict_count,
      execution_speed = excluded.execution_speed,
      intervention_completion_rate = excluded.intervention_completion_rate,
      decision_latency = excluded.decision_latency,
      governance_discipline = excluded.governance_discipline,
      last_event_version = excluded.last_event_version,
      calculated_at = excluded.calculated_at,
      updated_at = now();
  end if;

  insert into cd.projector_checkpoint (
    projector_name,
    last_event_id,
    last_event_created_at,
    last_event_version,
    updated_at
  ) values (
    'default_projector',
    p_event.id,
    p_event.created_at,
    p_event.version,
    now()
  )
  on conflict (projector_name) do update
  set
    last_event_id = excluded.last_event_id,
    last_event_created_at = excluded.last_event_created_at,
    last_event_version = excluded.last_event_version,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function cd.project_event(p_event_id uuid)
returns void
language plpgsql
as $$
declare
  v_event cd.event_store;
begin
  select *
  into v_event
  from cd.event_store
  where id = p_event_id;

  if v_event.id is null then
    raise exception 'Event % not found in cd.event_store', p_event_id;
  end if;

  perform cd.project_event_row(v_event);
end;
$$;

create or replace function cd.project_event_trigger()
returns trigger
language plpgsql
as $$
begin
  perform cd.project_event_row(new);
  return new;
end;
$$;

drop trigger if exists trg_project_event_store_insert on cd.event_store;
create trigger trg_project_event_store_insert
after insert on cd.event_store
for each row
execute function cd.project_event_trigger();

create or replace function cd.rebuild_decision_cycle_projection(p_decision_cycle_id uuid)
returns table (
  decision_cycle_id uuid,
  cycle_status text,
  latest_analysis_status text,
  dsi numeric,
  last_event_version integer
)
language plpgsql
as $$
declare
  v_event cd.event_store;
begin
  delete from cd.dsi_projection where decision_cycle_id = p_decision_cycle_id;
  delete from cd.governance_projection where decision_cycle_id = p_decision_cycle_id;
  delete from cd.decision_cycle_projection where decision_cycle_id = p_decision_cycle_id;

  for v_event in
    select *
    from cd.event_store
    where aggregate_type = 'decision_cycle'
      and aggregate_id = p_decision_cycle_id
    order by version asc, created_at asc
  loop
    perform cd.project_event_row(v_event);
  end loop;

  return query
  select
    dcp.decision_cycle_id,
    dcp.cycle_status,
    dcp.latest_analysis_status,
    dsp.dsi,
    greatest(coalesce(dcp.last_event_version, 0), coalesce(dsp.last_event_version, 0)) as last_event_version
  from cd.decision_cycle_projection dcp
  left join cd.dsi_projection dsp
    on dsp.decision_cycle_id = dcp.decision_cycle_id
  where dcp.decision_cycle_id = p_decision_cycle_id;
end;
$$;

-- --------------------------------------------------------------------------
-- Domain-to-event emitters (connects canonical tables to event store)
-- --------------------------------------------------------------------------

create or replace function cd.emit_event_from_decision_cycle()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform cd.append_event(
      'decision_cycle',
      new.id,
      'decision_cycle_created',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'cycle_key', new.cycle_key,
        'title', new.title,
        'scope', new.scope,
        'status', new.status,
        'opened_at', new.opened_at
      ),
      coalesce(new.created_by, 'system'),
      null,
      null
    );
  end if;

  return new;
end;
$$;

create or replace function cd.emit_event_from_analysis_run()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'running' then
      perform cd.append_event(
        'decision_cycle',
        new.decision_cycle_id,
        'analysis_started',
        jsonb_build_object(
          'organization_id', new.organization_id,
          'analysis_run_id', new.id,
          'status', new.status,
          'analysis_kind', new.analysis_kind,
          'model_name', new.model_name,
          'prompt_version', new.prompt_version
        ),
        coalesce(new.requested_by, 'system'),
        new.request_id,
        null
      );
    end if;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'running' then
      perform cd.append_event(
        'decision_cycle',
        new.decision_cycle_id,
        'analysis_started',
        jsonb_build_object(
          'organization_id', new.organization_id,
          'analysis_run_id', new.id,
          'status', new.status,
          'analysis_kind', new.analysis_kind,
          'model_name', new.model_name,
          'prompt_version', new.prompt_version
        ),
        coalesce(new.requested_by, 'system'),
        new.request_id,
        old.id::text
      );
    elsif new.status = 'done' then
      perform cd.append_event(
        'decision_cycle',
        new.decision_cycle_id,
        'analysis_completed',
        jsonb_build_object(
          'organization_id', new.organization_id,
          'analysis_run_id', new.id,
          'status', new.status,
          'cycle_status', (select status from cd.decision_cycle where id = new.decision_cycle_id),
          'output_checksum', new.output_checksum
        ),
        coalesce(new.requested_by, 'system'),
        new.request_id,
        old.id::text
      );
    elsif new.status = 'failed' then
      perform cd.append_event(
        'decision_cycle',
        new.decision_cycle_id,
        'analysis_failed',
        jsonb_build_object(
          'organization_id', new.organization_id,
          'analysis_run_id', new.id,
          'status', new.status,
          'cycle_status', (select status from cd.decision_cycle where id = new.decision_cycle_id),
          'error_code', new.error_code,
          'error_message', new.error_message
        ),
        coalesce(new.requested_by, 'system'),
        new.request_id,
        old.id::text
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function cd.emit_event_from_decision_record()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform cd.append_event(
      'decision_cycle',
      new.decision_cycle_id,
      'decision_committed',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'decision_record_id', new.id,
        'decision_code', new.decision_code,
        'decision_statement', new.decision_statement,
        'outcome', new.outcome,
        'approved_by', new.approved_by,
        'approved_at', new.approved_at,
        'cycle_status', (select status from cd.decision_cycle where id = new.decision_cycle_id)
      ),
      coalesce(new.created_by, new.approved_by, 'system'),
      null,
      null
    );
  end if;

  return new;
end;
$$;

create or replace function cd.emit_event_from_intervention()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform cd.append_event(
      'decision_cycle',
      new.decision_cycle_id,
      'intervention_created',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'intervention_id', new.id,
        'intervention_code', new.intervention_code,
        'status', new.status,
        'owner_name', new.owner_name
      ),
      coalesce(new.created_by, 'system'),
      null,
      null
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.status = 'completed' then
    perform cd.append_event(
      'decision_cycle',
      new.decision_cycle_id,
      'intervention_completed',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'intervention_id', new.id,
        'status', new.status,
        'actual_impact_score', new.actual_impact_score
      ),
      coalesce(new.updated_by, 'system'),
      null,
      old.id::text
    );
  end if;

  return new;
end;
$$;

create or replace function cd.emit_event_from_governance_metric()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform cd.append_event(
      'decision_cycle',
      new.decision_cycle_id,
      'governance_metric_updated',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'metric_code', new.metric_code,
        'observed_value', new.observed_value,
        'observed_at', new.observed_at,
        'source_system', new.source_system
      ),
      coalesce(new.source_system, 'system'),
      null,
      null
    );
  end if;

  return new;
end;
$$;

create or replace function cd.emit_event_from_snapshot()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform cd.append_event(
      'decision_cycle',
      new.decision_cycle_id,
      'DSI_recalculated',
      jsonb_build_object(
        'organization_id', new.organization_id,
        'snapshot_id', new.id,
        'version_no', new.version_no,
        'dsi_score', new.dsi_score,
        'captured_at', new.captured_at,
        'risk_index', new.risk_index,
        'execution_index', new.execution_index,
        'compliance_index', new.compliance_index
      ),
      coalesce(new.captured_by, 'system'),
      null,
      null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_emit_decision_cycle_event on cd.decision_cycle;
create trigger trg_emit_decision_cycle_event
after insert on cd.decision_cycle
for each row
execute function cd.emit_event_from_decision_cycle();

drop trigger if exists trg_emit_analysis_run_event on cd.analysis_run;
create trigger trg_emit_analysis_run_event
after insert or update of status on cd.analysis_run
for each row
execute function cd.emit_event_from_analysis_run();

drop trigger if exists trg_emit_decision_record_event on cd.decision_record;
create trigger trg_emit_decision_record_event
after insert on cd.decision_record
for each row
execute function cd.emit_event_from_decision_record();

drop trigger if exists trg_emit_intervention_event on cd.intervention;
create trigger trg_emit_intervention_event
after insert or update of status on cd.intervention
for each row
execute function cd.emit_event_from_intervention();

drop trigger if exists trg_emit_governance_metric_event on cd.governance_metric_observation;
create trigger trg_emit_governance_metric_event
after insert on cd.governance_metric_observation
for each row
execute function cd.emit_event_from_governance_metric();

drop trigger if exists trg_emit_snapshot_event on cd.decision_cycle_snapshot;
create trigger trg_emit_snapshot_event
after insert on cd.decision_cycle_snapshot
for each row
execute function cd.emit_event_from_snapshot();

-- --------------------------------------------------------------------------
-- Views for operational and audit read models
-- --------------------------------------------------------------------------

create or replace view cd.v_decision_cycle_event_stream as
select
  es.id,
  es.aggregate_type,
  es.aggregate_id,
  es.event_type,
  es.payload,
  es.version,
  es.correlation_id,
  es.causation_id,
  es.created_by,
  es.created_at
from cd.event_store es
where es.aggregate_type = 'decision_cycle'
order by es.aggregate_id, es.version asc;

create or replace view cd.v_dsi_realtime as
select
  dsp.decision_cycle_id,
  dsp.organization_id,
  dsp.dsi,
  dsp.conflict_count,
  dsp.execution_speed,
  dsp.intervention_completion_rate,
  dsp.decision_latency,
  dsp.governance_discipline,
  dsp.calculated_at,
  dsp.last_event_version
from cd.dsi_projection dsp;

