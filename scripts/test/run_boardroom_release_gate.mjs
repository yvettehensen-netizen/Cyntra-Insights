#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const checks = [
  ["node", ["scripts/test/run_report_render_quality_regression.mjs"]],
  ["node", ["scripts/test/run_report_pdf_actions_regression.mjs"]],
  ["node", ["scripts/test/run_short_dossier_export_regression.mjs"]],
  ["node", ["scripts/test/run_marketing_cta_login_regression.mjs"]],
  ["node", ["scripts/test/run_auth_route_consolidation.mjs"]],
];

if (process.env.REPORT_E2E_BASE_URL || process.env.CYNTRA_RUN_RUNTIME_E2E === "1") {
  checks.push(["node", ["scripts/test/run_marketing_cta_login_runtime_regression.mjs"]]);
} else {
  console.log(
    "skipping runtime marketing CTA E2E (set REPORT_E2E_BASE_URL or CYNTRA_RUN_RUNTIME_E2E=1 to enable)"
  );
}

for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("boardroom release gate passed");
