#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const targetPath = path.resolve(
  process.cwd(),
  "src/platform/AnalysisSessionManager.ts"
);
const source = fs.readFileSync(targetPath, "utf8");

assert(
  source.includes("sector?: string;"),
  "boardroom modules helper mist expliciete sector-parameter"
);
assert(
  source.includes("organizationType?: string;"),
  "boardroom modules helper mist expliciete organizationType-parameter"
);
assert(
  source.includes("sector: input.sector,"),
  "runSession geeft sector niet expliciet door aan boardroom modules helper"
);
assert(
  source.includes("organizationType: input.organisatie_grootte,"),
  "runSession geeft organisatiegrootte niet expliciet door aan boardroom modules helper"
);
assert(
  source.includes("sector?: string,\n  organizationType?: string\n): string {") ||
    source.includes("sector?: string,\r\n  organizationType?: string\r\n): string {"),
  "buildDutchReport mist expliciete sector/organizationType-parameters"
);
assert(
  source.includes("input.organization_name,\n        input.sector,\n        input.organisatie_grootte") ||
    source.includes("input.organization_name,\r\n        input.sector,\r\n        input.organisatie_grootte"),
  "buildDutchReport krijgt sector/organizationType niet expliciet door"
);
assert(
  !source.includes("sector: output?.context_state?.sector || input.sector,"),
  "vrije input-referentie in strategic memory block is nog aanwezig"
);
assert(
  !source.includes("organizationType: input.organisatie_grootte || organizationName,"),
  "vrije input-referentie voor organizationType is nog aanwezig"
);

console.log("boardroom modules input scope regression passed");
