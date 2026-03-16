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
  source.includes("function safelyBuildBoardroomDecisionModulesV3("),
  "boardroom modules missen runtime resilience wrapper"
);
assert(
  source.includes('console.warn("Boardroom modules skipped after runtime error", error);'),
  "runtime fouten in boardroom modules worden niet defensief gelogd"
);
assert(
  source.includes("const boardroomModulesV3Final = safelyBuildBoardroomDecisionModulesV3({"),
  "boardroom modules worden nog zonder resilience wrapper aangeroepen"
);

console.log("boardroom modules resilience regression passed");
