#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const synthPath = path.resolve(process.cwd(), "src/engine/reportSynthesizer.ts");
const source = fs.readFileSync(synthPath, "utf8");

if (source.includes("beschrijving wordt aangevuld")) {
  throw new Error("Scenario fallback still contains the placeholder string");
}
if (!source.includes("buildScenarioFallbackContexts")) {
  throw new Error("Scenario fallback helper is missing");
}
if (!source.includes("fallbackContexts[index]?.title")) {
  throw new Error("Scenario fallback contexts are not wired into the mapping logic");
}

console.log("scenario fallback regression passed");
