begin;

-- ============================================================================
-- Cyntra Insights: analysis RLS hardening
-- - Enables RLS on all public base tables
-- - Removes anon/public policies on analysis tables
-- - Adds authenticated policies for analysis feature tables
-- - Keeps governance_metrics write-restricted (no authenticated write policy)
-- ============================================================================

-- 1) Enable RLS on all public base tables
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schema_name, r.table_name);
  END LOOP;
END
$$;

-- 2) Targeted hardening for analysis tables
DO $$
DECLARE
  t text;
  target_tables text[] := ARRAY[
    'analysis_audit_log',
    'analysis_cache',
    'route_logs',
    'governance_metrics',
    'analysis_chunks',
    'analysis_jobs'
  ];

  pol record;
  has_org_memberships boolean;
  has_organisation_id boolean;
  has_organization_id boolean;
  has_user_id boolean;
  has_created_by boolean;
  has_owner_id boolean;
  row_predicate text;
BEGIN
  SELECT to_regclass('public.organisation_memberships') IS NOT NULL INTO has_org_memberships;

  FOREACH t IN ARRAY target_tables LOOP
    IF to_regclass(format('public.%s', t)) IS NULL THEN
      RAISE NOTICE 'Skipping %, table does not exist', t;
      CONTINUE;
    END IF;

    -- Defensive grant hardening against anon/public direct grants.
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);

    -- Drop known broad policy names (idempotent).
    EXECUTE format('DROP POLICY IF EXISTS "Public access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Enable insert for all users" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Enable update for all users" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Enable delete for all users" ON public.%I', t);

    -- Drop any policy explicitly granted to anon or public.
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND (
          'anon' = ANY(roles)
          OR 'public' = ANY(roles)
        )
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    -- Build the row predicate using available ownership/org columns.
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'organisation_id'
    ) INTO has_organisation_id;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'organization_id'
    ) INTO has_organization_id;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'user_id'
    ) INTO has_user_id;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'created_by'
    ) INTO has_created_by;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'owner_id'
    ) INTO has_owner_id;

    IF has_org_memberships AND has_organisation_id THEN
      row_predicate := 'EXISTS (SELECT 1 FROM public.organisation_memberships om WHERE om.organisation_id = organisation_id AND om.user_id = auth.uid())';
    ELSIF has_org_memberships AND has_organization_id THEN
      row_predicate := 'EXISTS (SELECT 1 FROM public.organisation_memberships om WHERE om.organisation_id = organization_id AND om.user_id = auth.uid())';
    ELSIF has_user_id THEN
      row_predicate := 'auth.uid() = user_id';
    ELSIF has_created_by THEN
      row_predicate := 'auth.uid() = created_by';
    ELSIF has_owner_id THEN
      row_predicate := 'auth.uid() = owner_id';
    ELSE
      row_predicate := 'auth.role() = ''authenticated''';
    END IF;

    -- SELECT for authenticated users (analysis visibility).
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'select_authenticated_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)',
      'select_authenticated_' || t,
      t,
      row_predicate
    );

    -- Write policies per table intent.
    IF t IN ('analysis_cache', 'analysis_jobs', 'analysis_chunks') THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'insert_authenticated_' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'update_authenticated_' || t, t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
        'insert_authenticated_' || t,
        t,
        row_predicate
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
        'update_authenticated_' || t,
        t,
        row_predicate,
        row_predicate
      );
    ELSIF t IN ('analysis_audit_log', 'route_logs') THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'insert_authenticated_' || t, t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
        'insert_authenticated_' || t,
        t,
        row_predicate
      );
    ELSIF t = 'governance_metrics' THEN
      -- Intentionally no authenticated write policy.
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'insert_authenticated_' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'update_authenticated_' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'delete_authenticated_' || t, t);
    END IF;
  END LOOP;
END
$$;

commit;

-- ============================================================================
-- Post-migration verification helpers (run manually)
-- ============================================================================
-- 1) RLS coverage
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;

-- 2) Analysis table policies
-- select schemaname, tablename, policyname, roles, cmd
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('analysis_audit_log','analysis_cache','route_logs','governance_metrics','analysis_chunks','analysis_jobs')
-- order by tablename, policyname;

-- 3) Role smoke test examples (execute in controlled session)
-- set local role anon;
-- select count(*) from public.analysis_jobs; -- should fail
-- reset role;
--
-- set local role authenticated;
-- select count(*) from public.analysis_jobs; -- should succeed if row predicate matches claims
-- reset role;
