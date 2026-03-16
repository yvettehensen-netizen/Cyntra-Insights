#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(repoRoot, relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function main() {
  const repoRoot = process.cwd();
  const orchestrator = read(repoRoot, "src/aurelius/agent/runCyntraStrategicAgent.ts");

  assert(/function ensureSimulationInBoardMemo\(/.test(orchestrator), "Simulation memo enforcer ontbreekt.");
  assert(/Optie A - Simulatie:/.test(orchestrator), "Optie A simulatieregel ontbreekt.");
  assert(/Optie B - Simulatie:/.test(orchestrator), "Optie B simulatieregel ontbreekt.");
  assert(/Optie C - Simulatie:/.test(orchestrator), "Optie C simulatieregel ontbreekt.");
  assert(
    /board_memo:\s*simulationEnforcedMemo/.test(orchestrator),
    "board_memo gebruikt simulationEnforcedMemo niet."
  );

  console.log("board memo simulation regression checks passed");
}

main();
