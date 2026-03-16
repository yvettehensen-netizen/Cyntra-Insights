#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const outputGuardPath = path.resolve(
  process.cwd(),
  "src/aurelius/stability/OutputContractGuard.ts"
);
const boardroomBriefPath = path.resolve(
  process.cwd(),
  "src/aurelius/synthesis/buildBoardroomBrief.ts"
);

const outputGuard = fs.readFileSync(outputGuardPath, "utf8");
const boardroomBrief = fs.readFileSync(boardroomBriefPath, "utf8");

assert(
  outputGuard.includes("function readDebugFlag") &&
    outputGuard.includes("export function shouldEmitStabilityConsoleWarnings"),
  "stability debug gate ontbreekt"
);
assert(
  outputGuard.includes("if (shouldEmitStabilityConsoleWarnings()) {\n    console.warn(line);"),
  "stability warnings loggen nog onvoorwaardelijk naar console"
);
assert(
  boardroomBrief.includes("if (shouldEmitStabilityConsoleWarnings())") &&
    boardroomBrief.includes('console.warn("[BoardGrade][SOFT_FAIL]"'),
  "board grade warning mist debug gate"
);

console.log("stability console quiet regression passed");
