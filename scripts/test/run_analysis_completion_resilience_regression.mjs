#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const intakePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/components/StrategicAnalysisIntake.tsx"
);

const source = fs.readFileSync(intakePath, "utf8");

assert(
  source.includes("function safelyCompleteSession("),
  "intake mist veilige post-analysis completion helper"
);

assert(
  source.includes('console.warn("Report navigation/seed skipped after successful analysis"'),
  "post-analysis completion fouten worden niet defensief gelogd"
);

assert(
  source.includes("safelyCompleteSession(reportId || sessionId, {"),
  "veilige completion helper wordt niet gebruikt na succesvolle analyse"
);

console.log("analysis completion resilience regression passed");
