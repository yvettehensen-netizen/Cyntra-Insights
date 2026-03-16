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
  const redFlagModule = await bundleModule(
    repoRoot,
    "src/aurelius/core/BoardroomRedFlagEngine.ts",
    "boardroom-red-flag-engine"
  );
  const mapModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/buildStrategicAnalysisMap.ts",
    "boardroom-red-flag-map"
  );
  const renderModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts",
    "boardroom-red-flag-render"
  );
  const pipelineModule = await bundleModule(
    repoRoot,
    "src/aurelius/pipeline/StrategicAnalysisPipeline.ts",
    "boardroom-red-flag-pipeline"
  );

  const { BoardroomRedFlagEngine } = redFlagModule;
  const { buildStrategicAnalysisMap } = mapModule;
  const { renderStrategicAnalysisMapReport } = renderModule;
  const { runStrategicAnalysisPipeline } = pipelineModule;

  const engine = new BoardroomRedFlagEngine();
  const flags = engine.run({
    sector: "Jeugdzorg",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    recommendedOption: "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
    decisionOptions: [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
    ],
    sourceText:
      "Gemeenten bepalen contractvolume, consortiumtriage bepaalt instroom, teams ervaren capaciteitsdruk en de organisatie wil tegelijk innoveren en verbreden.",
  });

  assert(flags.length >= 3, "BoardroomRedFlagEngine detecteert minder dan 3 red flags");
  assert(flags.every((flag) => flag.description && flag.mechanism && flag.boardQuestion), "Red flags zijn niet compleet");
  assert(flags.some((flag) => /strategie zonder macht|afhankelijkheid buiten organisatie/i.test(flag.category)), "Kern-red flags ontbreken");

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
      "Gemeenten bepalen contractruimte, consortiumtriage bepaalt instroom, innovatieprojecten concurreren met teamcapaciteit en de organisatie wil breed blijven.",
    interventionOutput: "ACTIE: Standaardiseer triage\nKPI: wachtdruk daalt",
  });

  assert((analysisMap.boardroomRedFlags ?? []).length >= 3, "Analysis map mist voldoende red flags");
  const report = renderStrategicAnalysisMapReport(analysisMap);
  assert(/Bestuurlijke waarschuwingssignalen/i.test(report), "Rapport mist red-flag-sectie");
  assert(/Red flag 1/i.test(report), "Rapport rendert red flags niet");

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
      "Gemeenten bepalen contractvolume, consortiumtriage bepaalt instroom en teams bepalen capaciteit.",
  });
  assert(pipeline.pipeline.includes("red flag detection"), "Pipeline mist red flag detection");
  assert(pipeline.redFlagSummary, "Pipeline mist red flag summary");

  console.log("boardroom red flag engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
