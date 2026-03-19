#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const filePath = path.resolve(
  process.cwd(),
  "src/components/reports/StrategyReportView.tsx"
);
const source = fs.readFileSync(filePath, "utf8");

assert(
  source.includes("function hasCanonicalStrategyReport"),
  "StrategyReportView mist canonical report guard"
);
assert(
  source.includes("legacyModel?.strategySections?.length"),
  "volledig dossier valt niet terug op strategySections uit het viewmodel"
);
assert(
  source.includes("legacyModel?.scenarioSections?.length"),
  "scenario-weergave valt niet terug op scenarioSections uit het viewmodel"
);
assert(
  source.includes("function resolveReportMeta"),
  "StrategyReportView normaliseert ruwe report metadata niet"
);
assert(
  !source.includes("report.meta.organisation"),
  "StrategyReportView leunt nog direct op report.meta.organisation"
);

console.log("full dossier resilience regression passed");
