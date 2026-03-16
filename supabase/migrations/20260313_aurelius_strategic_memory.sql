create table if not exists public.aurelius_strategic_memory (
  memory_id text primary key,
  created_at timestamptz not null default now(),
  sector text not null,
  organization_type text not null,
  dominant_problem text not null,
  dominant_paradox text null,
  recommended_strategy text not null,
  key_risks text[] not null default '{}',
  leverage_points text[] not null default '{}',
  blind_spots text[] not null default '{}',
  interventions text[] not null default '{}'
);

create index if not exists idx_aurelius_strategic_memory_sector
  on public.aurelius_strategic_memory (sector);

create index if not exists idx_aurelius_strategic_memory_problem
  on public.aurelius_strategic_memory (dominant_problem);
