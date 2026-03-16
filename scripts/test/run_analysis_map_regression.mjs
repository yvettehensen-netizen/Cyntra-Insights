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
  const pipelineModule = await bundleModule(
    repoRoot,
    "src/aurelius/pipeline/StrategicAnalysisPipeline.ts",
    "strategic-analysis-pipeline"
  );
  const renderModule = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts",
    "render-analysis-map-report"
  );
  const validatorModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/validators/BoardReportValidator.ts",
    "board-report-validator-map"
  );
  const consistencyModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/validators/StrategicConsistencyGuard.ts",
    "strategic-consistency-map"
  );

  const { runStrategicAnalysisPipeline } = pipelineModule;
  const { renderStrategicAnalysisMapReport } = renderModule;
  const { validateBoardReport } = validatorModule;
  const { validateStrategicConsistency } = consistencyModule;

  const result = runStrategicAnalysisPipeline({
    organisation: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    dominantRisk:
      "Contractgedreven instroom en budgetgedreven capaciteit zetten de kern onder druk",
    strategicOptions: [
      "Brede ambulante specialist blijven",
      "Selectieve specialisatie / niche kiezen",
      "Consortiumstrategie verdiepen",
    ],
    recommendedOption: "Brede ambulante specialist blijven",
    scenarioSimulationOutput: `
SCENARIO A — Brede ambulante specialist blijven
STRATEGISCHE LOGICA: behoud brede ambulante positionering
ORGANISATORISCHE CONSEQUENTIES: bestuur beschermt kerncapaciteit
RISICO'S: beperkte verbreding

SCENARIO B — Selectieve specialisatie / niche kiezen
STRATEGISCHE LOGICA: versmal het aanbod
ORGANISATORISCHE CONSEQUENTIES: scherpere focus
RISICO'S: smallere instroombasis

SCENARIO C — Consortiumstrategie verdiepen
STRATEGISCHE LOGICA: versterk regionale samenwerking
ORGANISATORISCHE CONSEQUENTIES: meer externe afstemming
RISICO'S: afhankelijkheid van partners
`.trim(),
    interventionOutput: `
ACTIE: Standaardiseer triage
WAAROM DEZE INTERVENTIE: beschermt de kern
RISICO VAN NIET HANDELEN: wachtdruk blijft oplopen
STOPREGEL: wachttijd > 12 weken
Eigenaar: Bestuur
Deadline: 15 dagen
KPI: wachtdruk daalt
`.trim(),
  });

  assert(result.analysisMap.organisation === "Jeugdzorg ZIJN", "analysis map mist organisatie");
  assert(result.analysisMap.sector === "Jeugdzorg", "analysis map mist sector");
  assert(result.analysisMap.strategicTension.optionA, "analysis map mist optionA");
  assert(result.analysisMap.strategicTension.optionB, "analysis map mist optionB");
  assert(result.analysisMap.scenarios.length >= 3, "analysis map mist scenario's");
  assert(result.analysisMap.interventions.length >= 10, "analysis map mist volledige interventieset");
  assert(result.analysisMap.systemMechanism?.mechanism, "analysis map mist systeemmechanisme");
  assert(result.analysisMap.strategicQuestions?.boardDecision, "analysis map mist strategische kernvragen");
  assert(result.analysisMap.strategicPattern?.primaryPattern, "analysis map mist strategisch patroon");
  assert(result.analysisMap.strategicPattern?.secondaryPattern, "analysis map mist secundair strategisch patroon");
  assert((result.analysisMap.boardroomRedFlags ?? []).length >= 3, "analysis map mist bestuurlijke waarschuwingssignalen");

  const report = renderStrategicAnalysisMapReport(result.analysisMap);
  assert(/Brede ambulante specialist blijven/i.test(report), "rapport rendert aanbevolen keuze niet uit map");
  assert(/Systeemmechanisme/i.test(report), "rapport mist systeemmechanismesectie");
  assert(/Strategische kernvragen/i.test(report), "rapport mist strategische kernvragen");
  assert(/Strategisch patroon/i.test(report), "rapport mist strategisch patroon");
  assert(/Bestuurlijke waarschuwingssignalen/i.test(report), "rapport mist bestuurlijke waarschuwingssignalen");

  const validation = validateBoardReport(report, result.analysisMap);
  assert(validation.issues.length === 0, "board validator geeft issues op map-render");

  const consistency = validateStrategicConsistency({
    reportText: report,
    sourceText: report,
    analysisMap: result.analysisMap,
  });
  assert(consistency.pass, "consistency guard faalt op map-render");

  console.log("analysis map regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
