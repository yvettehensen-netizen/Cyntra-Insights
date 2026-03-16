#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

async function loadRuntimeModule(entryPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);

  await build({
    entryPoints: [entryPath],
    outfile: outFile,
    format: "esm",
    platform: "node",
    target: ["node20"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });

  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const pipelinePath = path.join(repoRoot, "src/aurelius/engine/runAureliusEngine.ts");
  const builderPath = path.join(repoRoot, "src/aurelius/synthesis/buildBoardroomBrief.ts");

  const pipelineSource = read(pipelinePath);
  const builderSource = read(builderPath);

  assert(
    /REQUIRED_STRATEGIC_NODES/.test(pipelineSource),
    "Strategische pipeline guardrail ontbreekt."
  );
  assert(
    /DominantThesisNode/.test(pipelineSource) &&
      /StrategicConflictNode/.test(pipelineSource) &&
      /BoardMemoNode/.test(pipelineSource),
    "Verplichte strategische nodes ontbreken in guardrailbron."
  );
  assert(
    /ensureRequiredBoardSections/.test(builderSource),
    "Boardroom section fallback-guard ontbreekt."
  );
  assert(
    /EXECUTIVE THESIS/.test(builderSource) &&
      /STRATEGISCHE SPANNING/.test(builderSource) &&
      /BOARDROOM STRESSTEST/.test(builderSource) &&
      /BESTUURLIJKE VRAAG/.test(builderSource),
    "Verplichte fallback-secties ontbreken in builder."
  );

  const pipelineRuntime = await loadRuntimeModule(pipelinePath, "strategic-pipeline-guard");
  const { getAureliusStrategicPipeline, validateStrategicPipelineGuardrails } = pipelineRuntime;

  const validation = validateStrategicPipelineGuardrails();
  assert.equal(validation.ok, true, `Strategische pipeline mist nodes: ${validation.missing.join(", ")}`);

  const pipeline = getAureliusStrategicPipeline();
  for (const required of [
    "DominantThesisNode",
    "StrategicConflictNode",
    "StrategicOptionsNode",
    "BoardDecisionNode",
    "InsightGenerationNode",
    "InterventionArchitectureNode",
    "ExecutionRiskNode",
    "DecisionContractNode",
    "BoardMemoNode",
  ]) {
    assert(
      pipeline.includes(required),
      `Strategische pipeline mist verplichte node: ${required}`
    );
  }

  console.log("strategic pipeline guardrail regression checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
