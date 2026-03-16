-- Restore table required by Board Adoption & Legitimiteitsindex module.

create table if not exists public.board_evaluation_results (
  id uuid primary key default gen_random_uuid(),
  board_member_id uuid not null,
  organisation_id uuid not null,
  clarity_score numeric(4,2) not null check (clarity_score between 0 and 10),
  decision_certainty numeric(4,2) not null check (decision_certainty between 0 and 10),
  risk_understanding numeric(4,2) not null check (risk_understanding between 0 and 10),
  governance_trust numeric(4,2) not null check (governance_trust between 0 and 10),
  instrument_perception numeric(4,2) not null check (instrument_perception between 0 and 10),
  overall_score numeric(4,2) generated always as (
    round(
      (
        clarity_score +
        decision_certainty +
        risk_understanding +
        governance_trust +
        instrument_perception
      ) / 5,
      2
    )
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_board_evaluation_results_org_created_at
  on public.board_evaluation_results (organisation_id, created_at desc);

create index if not exists idx_board_evaluation_results_member_created_at
  on public.board_evaluation_results (board_member_id, created_at desc);

alter table public.board_evaluation_results enable row level security;

drop policy if exists "board_evaluation_insert_authenticated" on public.board_evaluation_results;
create policy "board_evaluation_insert_authenticated"
  on public.board_evaluation_results
  for insert
  to authenticated
  with check (
    auth.uid() = board_member_id
    and exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = board_evaluation_results.organisation_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists "board_evaluation_select_member_org" on public.board_evaluation_results;
create policy "board_evaluation_select_member_org"
  on public.board_evaluation_results
  for select
  to authenticated
  using (
    auth.uid() = board_member_id
    or exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = board_evaluation_results.organisation_id
        and om.user_id = auth.uid()
    )
  );
