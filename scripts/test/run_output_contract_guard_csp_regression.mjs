#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const guardPath = path.resolve(
  process.cwd(),
  "src/aurelius/stability/OutputContractGuard.ts"
);

const source = fs.readFileSync(guardPath, "utf8");

assert(
  source.includes("function canWriteNodeStabilityLog(): boolean"),
  "OutputContractGuard mist runtime-check voor Node logging"
);

assert(
  source.includes('typeof window === "undefined"'),
  "OutputContractGuard beschermt browserruntime niet tegen node-imports"
);

assert(
  source.includes("if (!canWriteNodeStabilityLog()) {"),
  "OutputContractGuard stopt node-bestandlogging niet vroegtijdig in browsercontext"
);

console.log("output contract guard csp regression passed");
