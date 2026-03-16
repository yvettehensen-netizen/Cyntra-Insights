#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function read(relPath) {
  const root = process.cwd();
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function main() {
  const architecture = read("src/aurelius/engine/complete/architecture.ts");
  const runner = read("src/aurelius/engine/complete/runCompletePipeline.ts");
  const agent = read("src/aurelius/agent/AgentOrchestrator.ts");
  const frontendEngine = read("src/aurelius/runAureliusEngine.ts");

  assert(
    /AURELIUS_COMPLETE_PIPELINE/.test(architecture),
    "Complete pipeline constant ontbreekt."
  );

  const nodeMatch = architecture.match(/AURELIUS_COMPLETE_PIPELINE:[\s\S]*?flatMap/);
  assert(nodeMatch, "Pipeline build ontbreekt.");
  const nodeCountMatch = architecture.match(/if \(nodes\.length !== (\d+)\)/);
  assert(nodeCountMatch && Number(nodeCountMatch[1]) === 38, "Node count gate moet 38 zijn.");

  assert(
    /validateCompleteArchitecture\(\)/.test(runner),
    "Runner moet architectuur valideren."
  );
  assert(
    /getAureliusStrategicPipeline\(\)/.test(agent),
    "Agent orchestrator gebruikt nog geen centrale pipeline."
  );
  assert(
    /pipeline:\s*getAureliusStrategicPipeline\(\)/.test(frontendEngine),
    "Frontend engine gebruikt nog geen centrale pipeline."
  );

  console.log("complete node architecture regression checks passed");
}

main();

