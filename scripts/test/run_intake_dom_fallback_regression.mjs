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
  source.includes("function readInputValueFromDom(id: string): string"),
  "intake mist DOM fallback reader voor submit-validatie"
);
assert(
  source.includes('readInputValueFromDom("analysis-organisation-name")'),
  "organisatienaam valt niet terug op DOM waarde"
);
assert(
  source.includes('readInputValueFromDom("analysis-sector")'),
  "sector valt niet terug op DOM waarde"
);
assert(
  source.includes('readInputValueFromDom("analysis-organisation-size")'),
  "organisatiegrootte valt niet terug op DOM waarde"
);
assert(
  source.includes('readInputValueFromDom("analysis-input")'),
  "analyse-input valt niet terug op DOM waarde"
);

console.log("intake dom fallback regression passed");
