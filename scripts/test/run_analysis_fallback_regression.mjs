#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const hookPath = path.resolve(
  process.cwd(),
  "src/aurelius/hooks/useCyntraAnalysis.tsx"
);
const source = fs.readFileSync(hookPath, "utf8");

assert(
  source.includes('fetch("/api/analyse"'),
  "Analyse hook mist lokale /api/analyse fallback."
);

assert(
  source.includes('fetch(`/api/analyse/status/${encodeURIComponent(runId)}`)'),
  "Analyse hook mist polling via /api/analyse/status/:runId."
);

assert(
  !source.includes('fetch("/api/analyze"'),
  "Legacy /api/analyze fallback mag niet meer gebruikt worden."
);

console.log("analysis fallback regression passed");
