#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"

if ! git rev-parse --verify --quiet "${BASE_REF}" >/dev/null; then
  if git rev-parse --verify --quiet "HEAD~1" >/dev/null; then
    echo "[WARN] BASE_REF '${BASE_REF}' niet gevonden; fallback naar HEAD~1"
    BASE_REF="HEAD~1"
  else
    echo "[WARN] BASE_REF '${BASE_REF}' niet gevonden; fallback naar HEAD"
    BASE_REF="HEAD"
  fi
fi

echo "[INFO] Level-2 invariant checks against base ref: ${BASE_REF}"

fail() {
  echo "[FAIL] $1"
  exit 1
}

pass() {
  echo "[PASS] $1"
}

if ! rg -n "export async function runCyntraAnalysis" src/cyntra/stabilization/runCyntraAnalysis.ts >/dev/null; then
  fail "canonical entry runCyntraAnalysis missing"
fi
pass "canonical entry exists"

if ! rg -n "const MAX_REPAIR_ATTEMPTS = 0;" src/cyntra/stabilization/runCyntraAnalysis.ts >/dev/null; then
  fail "MAX_REPAIR_ATTEMPTS is not fixed at 0"
fi
pass "MAX_REPAIR_ATTEMPTS fixed to 0"

if ! rg -n "single_call_mode vereist in stabilisatiemodus" supabase/functions/aurelius-analyze/index.ts >/dev/null; then
  fail "single_call_mode hard guard missing"
fi
pass "single_call_mode guard present"

if ! rg -n "stableSerialize|sha256\\(" src/cyntra/stabilization/decisionInfrastructure.ts >/dev/null; then
  fail "deterministic hashing path missing"
fi
pass "deterministic hashing path present"

if ! rg -n "DecisionInfrastructureError" src/cyntra/stabilization/runCyntraAnalysis.ts >/dev/null; then
  fail "infra write hard-fail propagation missing"
fi
pass "infra write hard-fail propagation present"

if rg -n "repairPrompt" supabase/functions/aurelius-analyze/index.ts >/dev/null; then
  fail "repair loop markers detected in edge function"
fi
pass "no repair loop markers"

if rg -n "runClassicOrchestrator|runClassicFallbackSingle" supabase/functions/aurelius-analyze/index.ts >/dev/null; then
  fail "multi-call orchestrator path detected"
fi
pass "no multi-call orchestrator path detected"

if rg -n "https://api.openai.com/v1/(chat/completions|embeddings)|new OpenAI\\(" src scripts | rg -v "supabase/functions/aurelius-analyze/index.ts" >/dev/null; then
  fail "extra direct LLM/OpenAI calls detected outside canonical edge path"
fi
pass "no extra direct LLM calls outside canonical edge path"

ALLOWED_UI_DRIFT_REGEX='^(src/App.tsx|src/layouts/(PortalLayout.tsx|Footer.tsx|AureliusLayout.tsx)|src/aurelius/components/AureliusNavbar.tsx|src/pages/aurelius/(ControlSurface.tsx|BoardTestPage.tsx|BoardEvaluationPage.tsx)|src/components/aurelius/control-surface/(index.ts|[^/]+\.tsx)|src/components/aurelius/board-evaluation/(index.ts|[^/]+\.tsx)|src/components/aurelius/performance/(index.ts|[^/]+\.tsx))$'
UI_CHANGED_FILES="$(git diff --name-only "${BASE_REF}"...HEAD | rg '^(src/pages|src/components|src/layouts|src/App.tsx|src/aurelius/pages/analysis/UnifiedAnalysisPage.tsx)' || true)"
if [[ -n "${UI_CHANGED_FILES}" ]]; then
  UI_UNAUTHORIZED="$(printf '%s\n' "${UI_CHANGED_FILES}" | rg -v "${ALLOWED_UI_DRIFT_REGEX}" || true)"
  if [[ -n "${UI_UNAUTHORIZED}" ]]; then
    fail "unauthorized UI drift detected ($(printf '%s\n' "${UI_UNAUTHORIZED}" | paste -sd ',' -))"
  fi
  UI_DRIFT_COUNT="$(printf '%s\n' "${UI_CHANGED_FILES}" | rg -v '^\s*$' | wc -l | tr -d ' ')"
  pass "UI drift restricted to authorized governance/unified-surface scope (${UI_DRIFT_COUNT} changed files)"
else
  pass "no UI drift detected"
fi

ALLOWED_API_ADDITIONS_REGEX='^(src/api/(submitBoardTestResult.ts|boardEvaluation.ts))$'
NEW_API_FILES="$(git diff --diff-filter=A --name-only "${BASE_REF}"...HEAD | rg '^src/api/' || true)"
if [[ -n "${NEW_API_FILES}" ]]; then
  API_UNAUTHORIZED="$(printf '%s\n' "${NEW_API_FILES}" | rg -v "${ALLOWED_API_ADDITIONS_REGEX}" || true)"
  if [[ -n "${API_UNAUTHORIZED}" ]]; then
    fail "unauthorized API additions detected ($(printf '%s\n' "${API_UNAUTHORIZED}" | paste -sd ',' -))"
  fi
  NEW_API_COUNT="$(printf '%s\n' "${NEW_API_FILES}" | rg -v '^\s*$' | wc -l | tr -d ' ')"
  pass "API additions restricted to authorized governance scope (${NEW_API_COUNT} files)"
else
  pass "no new API route files detected"
fi

echo "[PASS] Level-2 invariants verified"
