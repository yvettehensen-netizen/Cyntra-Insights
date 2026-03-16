#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const reportPagePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"
);

const source = fs.readFileSync(reportPagePath, "utf8");

assert(
  source.includes("function matchesReportSelection("),
  "rapportpagina mist canonieke report/session selectiehelper"
);

assert(
  source.includes("row.sessionId === candidate || row.reportId === candidate"),
  "rapportselectie ondersteunt reportId/sessionId-mismatch niet"
);

assert(
  source.includes("setSelectedSessionId(targetId);"),
  "rapportselectie gebruikt nog geen canonieke targetId"
);

assert(
  source.includes("navigate(buildPortalReportPath(targetId"),
  "kaartselectie navigeert niet met canonieke reportId"
);

console.log("report selection identity regression passed");
