-- FASE H: Board Test Module opslag

create table if not exists public.board_test_results (
  id uuid primary key default gen_random_uuid(),
  board_member_id uuid not null,
  clarity_score integer not null check (clarity_score between 1 and 5),
  decision_confidence numeric(5,2) not null check (decision_confidence between 0 and 100),
  perceived_maturity numeric(5,2) not null check (perceived_maturity between 0 and 100),
  feedback text not null default '',
  created_at timestamptz not null default now()
);

alter table public.board_test_results enable row level security;

drop policy if exists "board_test_insert_authenticated" on public.board_test_results;
create policy "board_test_insert_authenticated"
  on public.board_test_results
  for insert
  to authenticated
  with check (auth.uid() = board_member_id);

drop policy if exists "board_test_select_own" on public.board_test_results;
create policy "board_test_select_own"
  on public.board_test_results
  for select
  to authenticated
  using (auth.uid() = board_member_id);
