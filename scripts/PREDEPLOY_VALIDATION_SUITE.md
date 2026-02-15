# Cyntra Pre-Deploy Validation Suite

Automatiseert Fase A (Pre-Deploy Checklist) voor baseline staging/production deploys.

## Naming & Location

Alle pre-deploy scripts staan onder:
- `scripts/predeploy/`

## 1) Invariant Static Checks

Script:
- `scripts/predeploy/check-invariants.sh`

Invariants:
- canonical entry `runCyntraAnalysis()`
- `single_call_mode` enforced
- `MAX_REPAIR_ATTEMPTS = 0`
- geen extra LLM-call surfaces
- geen ongeautoriseerde UI/route drift (alleen unified/governance scope toegestaan)
- geen ongeautoriseerde API toevoegingen (alleen unified/governance scope toegestaan)

CLI:

```bash
npm run predeploy:invariants -- --base-ref origin/main
```

Exit codes:
- `0` pass
- `1` invariant breach
- `2` config/invocation error

## 2) Local Smoke Validation

Script:
- `scripts/predeploy/run-local-smoke-validation.sh`

Doel:
- enhanced smoke op canonical runner
- validatie van writes naar:
  - `decision_memory`
  - `decision_metrics`
  - `analysis_audit_log`
- optioneel extra staging smoke (`--with-staging`)

CLI:

```bash
npm run predeploy:smoke -- --output-dir reports/predeploy/manual
npm run predeploy:smoke -- --with-staging --output-dir reports/predeploy/manual
```

Artifacts:
- `smoke-status.json`
- `smoke-local.log`
- `smoke-staging.log` (indien gebruikt)

Exit codes:
- `0` pass
- `1` smoke failure
- `2` config/invocation error

## 3) SQL Health Assertions

Scripts:
- `scripts/predeploy/sql/20_predeploy_health_assertions.sql`
- `scripts/predeploy/run-sql-health-assertions.sh`

Assertions:
- `invalid_hash_rows = 0`
- `single_call_regressions = 0` (7d)
- `repair_loop_count = 0` (7d)
- `decision_memory` coverage = `100%`
- `decision_metrics` coverage = `100%`
- `ops.write_coverage_daily` ratio checks = `1.0`
- `ops.v_contract_fail_daily` `422` rate average over 7d `< 2%`

CLI:

```bash
npm run predeploy:sql -- --output-dir reports/predeploy/manual
```

Expected values (psql):

```sql
select memory_per_audit_ratio, metrics_per_audit_ratio
from ops.write_coverage_daily
where day >= current_date - interval '1 day';
-- expected both = 1.0
```

## 4) Summary Report (JSON/TSV/CSV)

Script:
- `scripts/predeploy/generate-predeploy-summary.mjs`

Output:
- `predeploy-summary.json`
- `predeploy-summary.tsv`
- `predeploy-summary.csv`

Velden:
- `smoke_status`
- `invalid_hash_rows`
- `decision_memory_coverage_pct_min_7d`
- `decision_metrics_coverage_pct_min_7d`
- `contract_422_rate_avg_pct_7d`
- `single_call_regressions_7d`

CLI:

```bash
npm run predeploy:summary -- --output-dir reports/predeploy/manual --smoke-json reports/predeploy/manual/smoke-status.json
```

## 5) Exit Codes & CI Integration

Master checklist runner:
- `scripts/predeploy/run-phase-a-checklist.sh`

CLI:

```bash
npm run predeploy:phase-a -- --base-ref origin/main
npm run predeploy:phase-a -- --with-staging --base-ref origin/main
npm run predeploy:phase-a -- --skip-build --base-ref origin/main
```

Policy:
- één failing assert => non-zero exit
- CI blockt deploy op exit `!= 0`

CI voorbeelden:
- `scripts/predeploy/ci/github-actions-predeploy.yml`
- `scripts/predeploy/ci/gitlab-ci-predeploy.yml`

## 6) Alerts (JSON pseudo-implementatie)

Script:
- `scripts/predeploy/alert-predeploy-breach.mjs`

Input:
- `--summary-json <path>`

Output:
- JSON payload met:
  - `overall_status`
  - `failed_metrics`
  - `smoke_status`
  - `thresholds`

CLI:

```bash
npm run predeploy:alert -- --summary-json reports/predeploy/<run>/predeploy-summary.json --out reports/predeploy/<run>/predeploy-alert.json
```

## 7) Test Harness Integration Examples

```bash
export ORG_ID="<uuid>"
export DATABASE_URL="<postgres-url>"
export SUPABASE_URL="<supabase-url>"
export SUPABASE_ANON_KEY="<anon-key>"
export SUPABASE_FUNCTIONS_URL="<functions-url>"
export AUTH_TOKEN="<jwt-or-service-role>"

# Strict gate for baseline deployment
npm run predeploy:phase-a -- --base-ref origin/main
```

```bash
# Optional: include staging smoke in dezelfde gate
export STAGING_SUPABASE_URL="<staging-supabase-url>"
export STAGING_SUPABASE_ANON_KEY="<staging-anon-key>"
export STAGING_AUTH_TOKEN="<staging-jwt-or-service-role>"
export STAGING_SUPABASE_FUNCTIONS_URL="<staging-functions-url>"

npm run predeploy:phase-a -- --with-staging --base-ref origin/main
```

## Full Pipeline (recommended)

```bash
npm run predeploy:phase-a -- --base-ref origin/main
```

Dit voert uit:
1. invariant static checks
2. build gate (`npm run build`)
3. local (en optioneel staging) smoke
4. SQL health assertions
5. summary export (JSON/TSV/CSV)

## Metric Definitions (Pre-Deploy KPIs)

- `invalid_hash_rows`
  Betekenis: aantal `decision_memory` rows met ontbrekende of niet-64-char hashes.
  Target: `0`.
- `single_call_regressions_7d`
  Betekenis: aantal audit-rows in 7 dagen met `single_call_mode = false`.
  Target: `0`.
- `repair_loop_count_7d`
  Betekenis: aantal audit-rows in 7 dagen met `repair_attempts > 0`.
  Target: `0`.
- `decision_memory_coverage_pct_min_7d`
  Betekenis: minimum write coverage naar `decision_memory` over auditruns.
  Target: `100`.
- `decision_metrics_coverage_pct_min_7d`
  Betekenis: minimum write coverage naar `decision_metrics` over auditruns.
  Target: `100`.
- `memory_per_audit_ratio_min_7d` en `metrics_per_audit_ratio_min_7d`
  Betekenis: ratio writes per audit.
  Target: exact `1.0`.
- `contract_422_rate_avg_pct_7d`
  Betekenis: gemiddelde contract failure-rate (422) in 7 dagen.
  Target: `< 2.0`.
