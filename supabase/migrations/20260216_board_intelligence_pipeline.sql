-- ============================================================================
-- Board Intelligence Pipeline Schema (compatible upgrade)
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- Base tables
-- ============================================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  type text not null default 'board_intelligence',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  input_payload jsonb not null,
  result_payload jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.analyses(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text not null,
  html_content text not null,
  pdf_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null unique,
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Compatibility upgrades for existing public.analyses schema
-- ============================================================================

alter table public.analyses add column if not exists organization_id uuid;
alter table public.analyses add column if not exists type text;
alter table public.analyses add column if not exists payload jsonb;
alter table public.analyses add column if not exists status text;
alter table public.analyses add column if not exists input_payload jsonb;
alter table public.analyses add column if not exists result_payload jsonb;
alter table public.analyses add column if not exists error_message text;
alter table public.analyses add column if not exists started_at timestamptz;
alter table public.analyses add column if not exists finished_at timestamptz;
alter table public.analyses add column if not exists updated_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'analyses' and column_name = 'company_id'
  ) then
    execute 'update public.analyses set organization_id = company_id where organization_id is null and company_id is not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'analyses' and column_name = 'organisation_id'
  ) then
    execute 'update public.analyses set organization_id = organisation_id where organization_id is null and organisation_id is not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'analyses' and column_name = 'payload'
  ) then
    execute 'update public.analyses set input_payload = payload where input_payload is null and payload is not null';
  end if;
end;
$$;

update public.analyses
set payload = input_payload
where payload is null and input_payload is not null;

update public.analyses
set payload = '{}'::jsonb
where payload is null;

update public.analyses
set type = 'board_intelligence'
where type is null or btrim(type) = '';

update public.analyses
set input_payload = '{}'::jsonb
where input_payload is null;

update public.analyses
set status = 'pending'
where status is null;

update public.analyses
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.analyses alter column status set default 'pending';
alter table public.analyses alter column type set default 'board_intelligence';
alter table public.analyses alter column payload set default '{}'::jsonb;
alter table public.analyses alter column type set not null;
alter table public.analyses alter column payload set not null;
alter table public.analyses alter column input_payload set default '{}'::jsonb;
alter table public.analyses alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'analyses_status_check'
      and conrelid = 'public.analyses'::regclass
  ) then
    alter table public.analyses
      add constraint analyses_status_check
      check (status in ('pending', 'running', 'done', 'failed'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'analyses_organization_id_fkey'
      and conrelid = 'public.analyses'::regclass
  ) then
    alter table public.analyses
      add constraint analyses_organization_id_fkey
      foreign key (organization_id)
      references public.organizations(id)
      on delete cascade
      not valid;
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('analysis-uploads', 'analysis-uploads', false, 10485760)
on conflict (id) do nothing;

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists idx_analyses_org_created
  on public.analyses (organization_id, created_at desc);

create index if not exists idx_analyses_status_created
  on public.analyses (status, created_at asc);

create index if not exists idx_analyses_created
  on public.analyses (created_at desc);

create index if not exists idx_analyses_input_payload_gin
  on public.analyses using gin (input_payload);

create index if not exists idx_analyses_result_payload_gin
  on public.analyses using gin (result_payload);

create index if not exists idx_reports_org_created
  on public.reports (organization_id, created_at desc);

create index if not exists idx_reports_analysis
  on public.reports (analysis_id);

create index if not exists idx_reports_metadata_gin
  on public.reports using gin (metadata);

create index if not exists idx_analysis_uploads_org_created
  on public.analysis_uploads (organization_id, created_at desc);

create index if not exists idx_analysis_uploads_analysis
  on public.analysis_uploads (analysis_id);

-- ============================================================================
-- Triggers
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_analysis_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'running' and new.started_at is null then
    new.started_at = now();
  end if;

  if new.status in ('done', 'failed') and new.finished_at is null then
    new.finished_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_analyses_updated_at on public.analyses;
create trigger trg_analyses_updated_at
before update on public.analyses
for each row
execute function public.set_updated_at();

drop trigger if exists trg_analyses_status_timestamps on public.analyses;
create trigger trg_analyses_status_timestamps
before insert or update on public.analyses
for each row
execute function public.set_analysis_status_timestamps();

drop trigger if exists trg_reports_updated_at on public.reports;
create trigger trg_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

drop trigger if exists trg_analysis_uploads_updated_at on public.analysis_uploads;
create trigger trg_analysis_uploads_updated_at
before update on public.analysis_uploads
for each row
execute function public.set_updated_at();

-- ============================================================================
-- Worker helper function
-- ============================================================================

create or replace function public.claim_pending_analysis()
returns setof public.analyses
language sql
security definer
set search_path = public
as $$
  with next_job as (
    select id
    from public.analyses
    where status = 'pending'
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.analyses a
  set status = 'running',
      started_at = coalesce(a.started_at, now()),
      updated_at = now()
  from next_job
  where a.id = next_job.id
  returning a.*;
$$;

-- ============================================================================
-- Helper view
-- ============================================================================

create or replace view public.v_analysis_overview as
select
  a.id,
  a.organization_id,
  o.name as organization_name,
  a.status,
  a.created_at,
  a.started_at,
  a.finished_at,
  r.id as report_id,
  r.title as report_title
from public.analyses a
join public.organizations o on o.id = a.organization_id
left join public.reports r on r.analysis_id = a.id;
