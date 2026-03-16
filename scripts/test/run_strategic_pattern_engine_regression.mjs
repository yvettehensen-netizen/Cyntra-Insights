#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundleModule(repoRoot, entryFile, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
  await build({
    entryPoints: [path.join(repoRoot, entryFile)],
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
  const patternModule = await bundleModule(
    repoRoot,
    "src/aurelius/core/StrategicPatternEngine.ts",
    "strategic-pattern-engine"
  );
  const mapModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/buildStrategicAnalysisMap.ts",
    "strategic-pattern-map"
  );
  const renderModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts",
    "strategic-pattern-render"
  );
  const pipelineModule = await bundleModule(
    repoRoot,
    "src/aurelius/pipeline/StrategicAnalysisPipeline.ts",
    "strategic-pattern-pipeline"
  );

  const { StrategicPatternEngine } = patternModule;
  const { buildStrategicAnalysisMap } = mapModule;
  const { renderStrategicAnalysisMapReport } = renderModule;
  const { runStrategicAnalysisPipeline } = pipelineModule;

  const engine = new StrategicPatternEngine();
  const pattern = engine.run({
    sector: "Jeugdzorg",
    sourceText:
      "Gemeenten bepalen budget en contractruimte, consortiumtriage bepaalt instroom, en teams bepalen uitvoerbaarheid in ambulante jeugdzorg.",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    decisionOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
    ],
  });

  assert(pattern.primaryPattern === "contractorganisatie", `Onjuist primair patroon: ${pattern.primaryPattern}`);
  assert(pattern.secondaryPattern === "capaciteitsorganisatie", `Onjuist secundair patroon: ${pattern.secondaryPattern}`);
  assert(/contractlogica|budgetruimte|capaciteit/i.test(pattern.mechanism), "Patternmechanisme te zwak");

  const analysisMap = buildStrategicAnalysisMap({
    organisation: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    strategicOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
      "Consortiumstrategie verdiepen om instroom en triage actiever te sturen",
    ],
    recommendedOption: "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
    memoryProblemText:
      "De organisatie werkt in een consortium, gemeenten bepalen budget en contractruimte, en teams dragen de capaciteit in ambulante jeugdzorg.",
    interventionOutput: "ACTIE: Standaardiseer triage\nKPI: wachtdruk daalt",
  });

  assert(analysisMap.strategicPattern?.primaryPattern === "contractorganisatie", "Analysis map mist primair patroon");
  assert(analysisMap.strategicPattern?.secondaryPattern, "Analysis map mist secundair patroon");

  const report = renderStrategicAnalysisMapReport(analysisMap);
  assert(/Strategisch patroon/i.test(report), "Rapport mist sectie Strategisch patroon");
  assert(/PRIMAIR PATROON — contractorganisatie/i.test(report), "Rapport rendert primair patroon niet");
  assert(/SECUNDAIR PATROON — capaciteitsorganisatie/i.test(report), "Rapport rendert secundair patroon niet");

  const pipeline = runStrategicAnalysisPipeline({
    organisation: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    strategicOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
    ],
    memoryProblemText:
      "Gemeenten bepalen contractruimte, consortiumtriage bepaalt instroom en teams bepalen capaciteit.",
  });

  assert(pipeline.pipeline.includes("pattern detection"), "Pipeline mist pattern detection");
  assert(pipeline.patternSummary, "Pipeline mist pattern summary");

  console.log("strategic pattern engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
