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
  const questionModule = await bundleModule(
    repoRoot,
    "src/aurelius/core/StrategicQuestionEngine.ts",
    "strategic-question-engine"
  );
  const mapModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/buildStrategicAnalysisMap.ts",
    "strategic-question-map"
  );
  const renderModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts",
    "strategic-question-render"
  );
  const pipelineModule = await bundleModule(
    repoRoot,
    "src/aurelius/pipeline/StrategicAnalysisPipeline.ts",
    "strategic-question-pipeline"
  );

  const { StrategicQuestionEngine } = questionModule;
  const { buildStrategicAnalysisMap } = mapModule;
  const { renderStrategicAnalysisMapReport } = renderModule;
  const { runStrategicAnalysisPipeline } = pipelineModule;

  const engine = new StrategicQuestionEngine();
  const questions = engine.run({
    organisation: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    strategy: "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    decisionOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
    ],
    sourceText:
      "De organisatie werkt in een consortium, gemeenten bepalen budget en contractruimte, en teams dragen de ambulante uitvoering.",
  });

  assert(/ambulante|maatwerk|casuistiek/i.test(questions.raisonDetre), "StrategicQuestionEngine mist bestaansrecht");
  assert(/gemeente|consortium|zorgorganisatie/i.test(questions.powerStructure), "StrategicQuestionEngine mist machtsstructuur");
  assert(/capaciteit|contractruimte|budget/i.test(questions.bottleneck), "StrategicQuestionEngine mist bottleneck");
  assert(/speciali|contract/i.test(questions.failurePoint), "StrategicQuestionEngine mist breekpunt");
  assert(/bestuur/i.test(questions.boardDecision), "StrategicQuestionEngine mist bestuursvraag");

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
      "Brede ambulante expertise, gemeentelijke contractdruk, consortiumtriage en capaciteit bepalen de strategische ruimte.",
    interventionOutput: "ACTIE: Standaardiseer triage\nKPI: wachtdruk daalt",
  });

  assert(analysisMap.strategicQuestions?.boardDecision, "Analysis map mist strategic questions");
  const report = renderStrategicAnalysisMapReport(analysisMap);
  assert(/Strategische kernvragen/i.test(report), "Rapport mist sectie Strategische kernvragen");
  assert(/1\.\s*BESTAANSRECHT/i.test(report), "Rapport mist vraag 1");
  assert(/5\.\s*BESTUURSVRAAG/i.test(report), "Rapport mist vraag 5");

  const pipeline = runStrategicAnalysisPipeline({
    organisation: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    strategicOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
    ],
  });
  assert(pipeline.pipeline.includes("five strategic questions"), "Pipeline mist vijf strategische vragen-stap");
  assert(pipeline.questionSummary, "Pipeline mist question summary");

  console.log("strategic question engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
