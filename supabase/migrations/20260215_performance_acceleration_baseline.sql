-- FASE 1: Performance-dominantie met Decision Strength Index (DSI)

create table if not exists public.organisation_performance_baseline (
  organisation_id uuid primary key,
  baseline_dsi numeric(4,2) not null check (baseline_dsi >= 0 and baseline_dsi <= 10),
  baseline_timestamp timestamptz not null default now(),
  baseline_sri numeric(6,2) not null check (baseline_sri >= 0 and baseline_sri <= 100),
  baseline_execution_score numeric(6,2) not null check (baseline_execution_score >= 0 and baseline_execution_score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organisation_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  measurement_date date not null,
  snapshot_timestamp timestamptz not null default now(),
  dsi numeric(4,2) not null check (dsi >= 0 and dsi <= 10),
  execution_score numeric(6,2) not null check (execution_score >= 0 and execution_score <= 100),
  decision_velocity numeric(6,2) not null check (decision_velocity >= 0 and decision_velocity <= 100),
  created_at timestamptz not null default now(),
  unique (organisation_id, measurement_date)
);

create index if not exists idx_org_performance_snapshots_org_date
  on public.organisation_performance_snapshots (organisation_id, measurement_date desc);

create index if not exists idx_org_performance_baseline_timestamp
  on public.organisation_performance_baseline (baseline_timestamp desc);

alter table public.organisation_performance_baseline enable row level security;
alter table public.organisation_performance_snapshots enable row level security;

drop policy if exists "performance_baseline_select_org_members" on public.organisation_performance_baseline;
create policy "performance_baseline_select_org_members"
  on public.organisation_performance_baseline
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_baseline.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "performance_baseline_insert_org_members" on public.organisation_performance_baseline;
create policy "performance_baseline_insert_org_members"
  on public.organisation_performance_baseline
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_baseline.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "performance_baseline_update_org_members" on public.organisation_performance_baseline;
create policy "performance_baseline_update_org_members"
  on public.organisation_performance_baseline
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_baseline.organisation_id
        and om.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_baseline.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "performance_snapshots_select_org_members" on public.organisation_performance_snapshots;
create policy "performance_snapshots_select_org_members"
  on public.organisation_performance_snapshots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_snapshots.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "performance_snapshots_insert_org_members" on public.organisation_performance_snapshots;
create policy "performance_snapshots_insert_org_members"
  on public.organisation_performance_snapshots
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_snapshots.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "performance_snapshots_update_org_members" on public.organisation_performance_snapshots;
create policy "performance_snapshots_update_org_members"
  on public.organisation_performance_snapshots
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_snapshots.organisation_id
        and om.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisation_performance_snapshots.organisation_id
        and om.user_id = auth.uid()
    )
  );

create or replace view public.organisation_performance_benchmark as
with latest_snapshot as (
  select distinct on (s.organisation_id)
    s.organisation_id,
    s.dsi as current_dsi,
    s.execution_score,
    s.snapshot_timestamp
  from public.organisation_performance_snapshots s
  order by s.organisation_id, s.snapshot_timestamp desc
),
improvement as (
  select
    b.organisation_id,
    b.baseline_dsi,
    coalesce(ls.current_dsi, b.baseline_dsi) as current_dsi,
    case
      when b.baseline_dsi > 0
        then round(((coalesce(ls.current_dsi, b.baseline_dsi) - b.baseline_dsi) / b.baseline_dsi) * 100, 2)
      else 0
    end as improvement_pct
  from public.organisation_performance_baseline b
  left join latest_snapshot ls
    on ls.organisation_id = b.organisation_id
),
stats as (
  select
    coalesce(round(avg(i.improvement_pct), 2), 0)::numeric(6,2) as gemiddelde_dsi_verbetering_pct,
    coalesce(round(percentile_cont(0.75) within group (order by i.improvement_pct), 2), 0)::numeric(6,2) as top_25_pct_grens,
    coalesce(round(percentile_cont(0.5) within group (order by i.improvement_pct), 2), 0)::numeric(6,2) as mediaan_verbetering_pct,
    coalesce(round((sum(case when i.improvement_pct < 1 then 1 else 0 end)::numeric / nullif(count(*), 0)) * 100, 2), 0)::numeric(6,2) as stagnatie_pct,
    count(*)::int as organisatie_aantal
  from improvement i
)
select *
from stats;
