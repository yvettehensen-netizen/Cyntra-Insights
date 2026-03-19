#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Boardroom v1 release preparation"
echo "root: $ROOT_DIR"

echo
echo "==> 1/3 Build"
npm run build

echo
echo "==> 2/3 Boardroom release gate"
CYNTRA_RUN_RUNTIME_E2E=0 node scripts/test/run_boardroom_release_gate.mjs

if [[ -n "${REPORT_E2E_BASE_URL:-}" || "${CYNTRA_RUN_RUNTIME_E2E:-0}" == "1" ]]; then
  echo
  echo "==> 3/3 Runtime marketing CTA E2E"
  if [[ -n "${REPORT_E2E_BASE_URL:-}" ]]; then
    echo "using REPORT_E2E_BASE_URL=${REPORT_E2E_BASE_URL}"
  else
    echo "CYNTRA_RUN_RUNTIME_E2E=1 is set; runtime E2E will use default local base URL"
  fi
  node scripts/test/run_marketing_cta_login_runtime_regression.mjs
else
  echo
  echo "==> 3/3 Runtime marketing CTA E2E skipped"
  echo "Set REPORT_E2E_BASE_URL=http://127.0.0.1:4174 or CYNTRA_RUN_RUNTIME_E2E=1 to enable."
fi

echo
echo "Boardroom v1 release preparation passed"
