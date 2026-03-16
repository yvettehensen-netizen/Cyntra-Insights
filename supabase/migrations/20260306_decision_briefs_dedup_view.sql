-- Server-side deduplicatie voor Decision OS kaarten
-- Houdt nieuwste/sterkste variant per (analysis_type, central_tension, dag)

create or replace view public.v_decision_briefs_dedup
with (security_invoker = true) as
with normalized as (
  select
    db.id,
    db.analysis_type,
    db.executive_thesis,
    db.central_tension,
    db.confidence_level,
    db.irreversibility_deadline,
    db.created_at,
    date(db.created_at) as created_day,
    lower(regexp_replace(coalesce(db.analysis_type, ''), '[^a-z0-9]+', ' ', 'g')) as analysis_key,
    lower(regexp_replace(coalesce(db.central_tension, ''), '[^a-z0-9]+', ' ', 'g')) as tension_key
  from public.decision_briefs db
),
ranked as (
  select
    normalized.*,
    row_number() over (
      partition by analysis_key, tension_key, created_day
      order by created_at desc, confidence_level desc nulls last, id desc
    ) as rn
  from normalized
)
select
  id,
  analysis_type,
  executive_thesis,
  central_tension,
  confidence_level,
  irreversibility_deadline,
  created_at
from ranked
where rn = 1
order by created_at desc;

grant select on public.v_decision_briefs_dedup to anon;
grant select on public.v_decision_briefs_dedup to authenticated;
grant select on public.v_decision_briefs_dedup to service_role;
