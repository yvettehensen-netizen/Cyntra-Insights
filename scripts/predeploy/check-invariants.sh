#!/usr/bin/env bash
set -euo pipefail

EXIT_BREACH=1
EXIT_CONFIG=2

BASE_REF="origin/main"

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/predeploy/check-invariants.sh [--base-ref <git-ref>]

Checks:
  - runCyntraAnalysis() canonical entry
  - single_call_mode enforced
  - MAX_REPAIR_ATTEMPTS = 0
  - no extra LLM-call surfaces
  - no unauthorized UI drift (alleen geautoriseerde unified/governance scope)
  - no unauthorized API additions (alleen geautoriseerde unified/governance scope)

Exit codes:
  0 = all invariants passed
  1 = invariant breach detected
  2 = invalid invocation / missing prerequisites
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-ref)
      BASE_REF="${2:-}"
      if [[ -z "${BASE_REF}" ]]; then
        echo "[FAIL] --base-ref requires a value"
        exit "${EXIT_CONFIG}"
      fi
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "[FAIL] Unknown argument: $1"
      usage
      exit "${EXIT_CONFIG}"
      ;;
  esac
done

if ! command -v rg >/dev/null 2>&1; then
  echo "[FAIL] ripgrep (rg) is required"
  exit "${EXIT_CONFIG}"
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[FAIL] git is required"
  exit "${EXIT_CONFIG}"
fi

echo "[INFO] Pre-deploy invariant gate (base-ref=${BASE_REF})"

if bash scripts/check-level2-invariants.sh "${BASE_REF}"; then
  echo "[PASS] Pre-deploy invariant gate passed"
  exit 0
fi

echo "[FAIL] Pre-deploy invariant gate failed"
exit "${EXIT_BREACH}"
