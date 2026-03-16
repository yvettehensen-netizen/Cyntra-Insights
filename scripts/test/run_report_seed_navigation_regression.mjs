#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const repoRoot = process.cwd();
const analysisPage = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/StrategischeAnalyseSaaSPage.tsx"),
  "utf8"
);
const intake = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/components/StrategicAnalysisIntake.tsx"),
  "utf8"
);
const reportPage = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"),
  "utf8"
);

assert(
  analysisPage.includes("seededReportSession: payload"),
  "analysepagina geeft verse analyse niet mee aan rapportroute"
);
assert(
  intake.includes("safelyCompleteSession(reportId || sessionId, {"),
  "intake geeft geen volledig rapport-seed payload door"
);
assert(
  reportPage.includes("const seededReportSession ="),
  "rapportpagina leest geen seeded report state"
);
assert(
  reportPage.includes("createSeededSessionRow(seededReportSession)"),
  "rapportpagina hydrateert verse analyses niet eerst uit route state"
);

console.log("report seed navigation regression passed");
