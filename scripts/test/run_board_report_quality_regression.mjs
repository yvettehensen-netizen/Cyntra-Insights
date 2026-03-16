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
  const narrativeSource = fs.readFileSync(
    path.join(repoRoot, "src/aurelius/narrative/generateBoardroomNarrative.ts"),
    "utf8"
  );
  const validatorModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/validators/BoardReportValidator.ts",
    "board-report-validator"
  );
  const consistencyModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/validators/StrategicConsistencyGuard.ts",
    "strategic-consistency-guard"
  );
  const scenarioModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/nodes/ScenarioSimulationNode.ts",
    "scenario-simulation-node"
  );
  const optionModule = await bundleModule(
    repoRoot,
    "src/aurelius/strategy/StrategicOptionGenerator.ts",
    "strategic-option-generator"
  );
  const modelModule = await bundleModule(
    repoRoot,
    "src/aurelius/simulation/StrategicScenarioModel.ts",
    "strategic-scenario-model"
  );

  const { validateBoardReport } = validatorModule;
  const { validateStrategicConsistency } = consistencyModule;
  const { buildScenarioSimulationNodePrompt } = scenarioModule;
  const { runStrategicOptionGenerator } = optionModule;
  const { buildStrategicScenarioModel } = modelModule;

  assert(
    /Broninput heeft prioriteit boven generieke strategiemodellen/i.test(narrativeSource),
    "boardroom system prompt mist input-dominance instructie"
  );
  assert(
    /Verboden als standaardscenario: status quo, hybride, volumegroei, groei zonder context/i.test(
      narrativeSource
    ),
    "boardroom scenario prompt mist verbod op generieke scenario's"
  );
  assert(
    /Geen generieke consultancy-abstracties zoals "bestuurlijke inertie"/i.test(narrativeSource),
    "boardroom stijlprompt mist verbod op generieke inertie-abstractie"
  );

  const brokenReport = `
Jeugdzorg ZIJN

Sector

Jeugdzorg

KERNSTELLING

Het probleem is niet activiteitstekort maar bestuurlijke inertie op het dominante risicomechanisme.

Aanbevolen keuze
A. Bescherm de kern en vertraag verbreding totdat capaciteit, contractruimte en governance aantoonbaar op orde zijn.

Keuzedruk 1
Herzie direct als De spanning zit tussen a.
Waarom niet optie C?
Omdat c. optie a — kies de richting met de hoogste bestuurlijke beheersbaarheid en laagste directe schade.

Scenario A — Volumegroei via extra capaciteit
`.trim();

  const leakedReport = `
Bestuurlijk actieplan

ACTIE — Voor Jeugdzorg ZIJN: Standaardiseer triage en wekelijkse capaciteitssturing
BESTUURLIJK BESLUIT — Laat het bestuur besluiten hoe Jeugdzorg deze interventie bestuurlijk borgt.

Samenvatting gesprekverslag Fireflies:
• Focus op veerkracht ambulante dienstverlening [Bron: Gesprek, 12 03 2026]
• Werkt met ±35 gemeenten [Bron: Gesprek, 12 03 2026]

🔴 ACTION ITEMS (gericht aan jou, gestructureerd per hooftopic)
• Review top 5 gemeenten op marge vs. casusvolumes [Bron: Gesprek, 12 03 2026]

Open strategische vragen
Welke keuze verlaagt nu het structurele risico?
`.trim();

  const inlineLeakReport = `
Besluitgevolgen

OPERATIONEEL GEVOLG — Wachtdruk loopt op. Bronnen: • Organisatiestrategie: focus op ambulante jeugdhulp.

Notes
• Losse transcriptnotitie
`.trim();

  const sourceText = `
De organisatie werkt in een consortium met gemeenten.
Triage en toegang liggen regionaal georganiseerd.
De strategie volgt contractafspraken en budgetgedreven capaciteit.
De positionering is brede ambulante jeugdhulp met maatwerk.
`.trim();

  const validated = validateBoardReport(brokenReport);
  assert(!/Keuzedruk 1/i.test(validated.sanitizedText), "validator verwijdert Keuzedruk niet");
  assert(!/Herzie direct als De spanning zit tussen a\./i.test(validated.sanitizedText), "validator verwijdert afgeknotte stopregel niet");
  assert(
    validated.issues.some((issue) => issue.code === "why_not_choice_leak"),
    "validator mist why-not keuzelekkage"
  );
  assert(
    validated.issues.some((issue) => issue.code === "generic_scenario"),
    "validator mist generiek scenariolabel"
  );

  const leakedValidation = validateBoardReport(leakedReport);
  assert(
    !/Samenvatting gesprekverslag Fireflies/i.test(leakedValidation.sanitizedText),
    "validator verwijdert ruwe Fireflies-kop niet"
  );
  assert(
    !/\[Bron:\s*Gesprek/i.test(leakedValidation.sanitizedText),
    "validator verwijdert bronbullets niet"
  );
  assert(
    !/ACTION ITEMS/i.test(leakedValidation.sanitizedText),
    "validator verwijdert action-items dump niet"
  );
  assert(
    /Het bestuur besluit deze interventie vast te stellen, te beleggen en op voortgang te toetsen\./i.test(
      leakedValidation.sanitizedText
    ),
    "validator normaliseert placeholder-besluittaal niet"
  );

  const inlineLeakValidation = validateBoardReport(inlineLeakReport);
  assert(
    !/Bronnen:/i.test(inlineLeakValidation.sanitizedText),
    "validator verwijdert inline bronlek niet"
  );
  assert(
    !/Notes/i.test(inlineLeakValidation.sanitizedText),
    "validator verwijdert inline notes-lek niet"
  );

  const consistency = validateStrategicConsistency({
    reportText: brokenReport,
    sourceText,
  });
  assert(
    consistency.findings.some((finding) => finding.code === "input_dominance_gap"),
    "consistency guard mist input-dominance fout"
  );
  assert(
    consistency.findings.some((finding) => finding.code === "scenario_alignment_gap"),
    "consistency guard mist scenario-alignmentsfout"
  );

  const prompt = buildScenarioSimulationNodePrompt({
    companyName: "Jeugdzorg ZIJN",
    caseContextBlock: sourceText,
    contextEngineReconstruction: sourceText,
    diagnosisEngineOutput: "Dominant mechanisme: contractgedreven instroom plus budgetgedreven capaciteit.",
    strategicInsightsOutput: "Spanning tussen brede ambulante positionering, specialisatie en consortiumrol.",
    hypothesisOutput: "Opties: brede ambulante specialist blijven; selectieve specialisatie; consortiumstrategie verdiepen.",
  });
  assert(/input > sectorlogica > generieke template/i.test(prompt), "scenario prompt mist input-dominance regel");
  assert(/Verboden scenarionamen/i.test(prompt), "scenario prompt mist verboden generieke scenario's");

  const options = runStrategicOptionGenerator({
    tension: [
      "regionale contractsturing en triage",
      "brede ambulante positionering versus specialisatie",
      "capaciteitsflexibiliteit binnen budgetgrenzen",
    ],
  });
  assert(
    /Brede ambulante specialist blijven/i.test(options.block),
    "strategische opties blijven te generiek voor jeugdzorgpositionering"
  );
  assert(
    /Consortiumstrategie verdiepen/i.test(options.block),
    "strategische opties missen consortiumspecifieke richting"
  );

  const scenarios = buildStrategicScenarioModel({
    strategic_options: options.options.map((option) => ({
      code: option.id,
      description: option.title,
      financial_effect: "n.v.t.",
      operational_effect: "n.v.t.",
      risk_profile: "Middel",
    })),
  });
  assert(
    scenarios.some((scenario) => /Brede ambulante specialist blijven/i.test(scenario.model)),
    "scenario model neemt brongebonden optienaam niet over"
  );
  assert(
    !scenarios.some((scenario) => /status_quo\s*\/\s*parallelle strategie/i.test(scenario.model)),
    "scenario model valt nog terug op generieke default labels"
  );

  console.log("board report quality regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
