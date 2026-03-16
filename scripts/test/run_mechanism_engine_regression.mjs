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
  const mechanismModule = await bundleModule(
    repoRoot,
    "src/aurelius/core/MechanismEngine.ts",
    "mechanism-engine"
  );
  const symptomCheckModule = await bundleModule(
    repoRoot,
    "src/aurelius/validators/SymptomWithoutMechanismCheck.ts",
    "symptom-without-mechanism-check"
  );
  const mapModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/buildStrategicAnalysisMap.ts",
    "build-strategic-analysis-map-mechanism"
  );
  const renderModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts",
    "render-analysis-map-report-mechanism"
  );

  const { MechanismEngine } = mechanismModule;
  const { symptomWithoutMechanismCheck } = symptomCheckModule;
  const { buildStrategicAnalysisMap } = mapModule;
  const { renderStrategicAnalysisMapReport } = renderModule;

  const engine = new MechanismEngine();
  const mechanism = engine.run({
    strategy: "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
    dominantRisk:
      "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost",
    sourceText:
      "Jeugdzorg ZIJN werkt in een consortium, instroom loopt via triage, gemeenten bepalen contractruimte en budgetten, en personeelsschaarste verhoogt druk.",
  });

  assert(/triage|contract|budget/i.test(mechanism.mechanism), "MechanismEngine mist sectorspecifiek mechanisme");
  assert(/gemeent|consortium|personeel/i.test(mechanism.systemPressure), "MechanismEngine mist systeemdruk");
  assert(mechanism.boardImplication.length > 20, "MechanismEngine mist bestuurlijke implicatie");

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
      "De organisatie kiest bewust voor brede ambulante jeugdhulp, maar werkt binnen consortiumtriage, gemeentelijke contractdruk en budgetgedreven capaciteit.",
    interventionOutput: "ACTIE: Standaardiseer triage\nKPI: wachtdruk daalt",
  });

  assert(analysisMap.systemMechanism?.mechanism, "StrategicAnalysisMap mist systemMechanism");
  const report = renderStrategicAnalysisMapReport(analysisMap);
  assert(/Systeemmechanisme/i.test(report), "Rapport mist systeemmechanismesectie");
  assert(/SYMPTOOM —/i.test(report) && /MECHANISME —/i.test(report), "Systeemmechanisme rendert niet volledig");

  const symptomCheck = symptomWithoutMechanismCheck(report, analysisMap);
  assert(symptomCheck.pass, `SymptomWithoutMechanismCheck faalt: ${symptomCheck.issues.join("; ")}`);

  console.log("mechanism engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
