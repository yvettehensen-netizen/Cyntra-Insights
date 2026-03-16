#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function installMemoryStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
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
  installMemoryStorage();
  const { StrategicMemoryEngine } = await bundleModule(
    repoRoot,
    "src/aurelius/core/StrategicMemoryEngine.ts",
    "sector-recommendation-ranking"
  );
  const { buildStrategicAnalysisMap } = await bundleModule(
    repoRoot,
    "src/aurelius/analysis/buildStrategicAnalysisMap.ts",
    "analysis-map-memory-ranking"
  );

  const engine = new StrategicMemoryEngine();
  engine.storeCase({
    case_id: "ggz-1",
    created_at: "2026-01-10",
    organisatie_type: "zorg",
    sector: "GGZ",
    organisatiegrootte: "120",
    dominant_problem: "Contractdruk en declaratieplafonds zetten de kern onder druk",
    dominant_thesis: "Bescherm de kern",
    mechanisms: ["contractdruk", "plafonds"],
    strategic_options: ["Kern beschermen en contractmix heronderhandelen"],
    gekozen_strategie: "Kern beschermen en contractmix heronderhandelen",
    interventieprogramma: "Contractmix aanscherpen",
    resultaat: "Marge herstelde",
  });
  engine.storeCase({
    case_id: "ggz-2",
    created_at: "2026-02-15",
    organisatie_type: "zorg",
    sector: "GGZ",
    organisatiegrootte: "80",
    dominant_problem: "Contractdruk en productiviteitsnorm zetten behandelcapaciteit onder druk",
    dominant_thesis: "Bescherm de kern",
    mechanisms: ["contractdruk", "capaciteit"],
    strategic_options: ["Kern beschermen en contractmix heronderhandelen"],
    gekozen_strategie: "Kern beschermen en contractmix heronderhandelen",
    interventieprogramma: "Productmix bijsturen",
    resultaat: "Wachtdruk daalde",
  });
  engine.storeCase({
    case_id: "ggz-3",
    created_at: "2026-02-20",
    organisatie_type: "zorg",
    sector: "GGZ",
    organisatiegrootte: "90",
    dominant_problem: "Groeiversnelling via nieuwe labels moet omzet verhogen",
    dominant_thesis: "Versnel verbreding",
    mechanisms: ["groei"],
    strategic_options: ["Parallel verbreden via nieuwe labels"],
    gekozen_strategie: "Parallel verbreden via nieuwe labels",
    interventieprogramma: "Nieuwe labels lanceren",
    resultaat: "Uitvoering werd instabiel",
  });
  engine.linkOutcome("ggz-1", {
    outcome_id: "out-ggz-1",
    outcome_summary: "Marge steeg boven 4%",
    outcome_score: "hoog",
    evaluation_date: "2026-05-01",
  });
  engine.linkOutcome("ggz-2", {
    outcome_id: "out-ggz-2",
    outcome_summary: "Wachttijd daalde onder 10 weken",
    outcome_score: "hoog",
    evaluation_date: "2026-05-15",
  });
  engine.linkOutcome("ggz-3", {
    outcome_id: "out-ggz-3",
    outcome_summary: "Kwaliteitsdruk liep op",
    outcome_score: "laag",
    evaluation_date: "2026-05-10",
  });

  const analysisMap = buildStrategicAnalysisMap({
    organisation: "GGZ Voor Jou",
    sector: "GGZ",
    dominantRisk: "Contractdruk en declaratieplafonds zetten de kern onder druk",
    strategicOptions: [
      "Kern beschermen en contractmix heronderhandelen",
      "Parallel verbreden via nieuwe labels",
    ],
    scenarioSimulationOutput: `
SCENARIO A — Kern beschermen
STRATEGISCHE LOGICA: consolideer capaciteit
RISICO'S: lagere groeisnelheid
BESTUURLIJKE IMPLICATIE: bestuur kiest focus

SCENARIO B — Parallel verbreden
STRATEGISCHE LOGICA: meerdere labels tegelijk uitbouwen
RISICO'S: hogere uitvoeringsdruk
BESTUURLIJKE IMPLICATIE: governance moet zwaarder worden
`.trim(),
    interventionOutput: `
ACTIE: Heronderhandel contractmix
WAAROM DEZE INTERVENTIE: beschermt marge en kerncapaciteit
RISICO VAN NIET HANDELEN: druk op uitvoering blijft oplopen
STOPREGEL: marge < 4%
Eigenaar: Directie
Deadline: 30 dagen
KPI: marge stijgt
`.trim(),
  });

  assert(
    analysisMap.memoryInsights?.rankedRecommendations?.[0]?.recommendation ===
      "Kern beschermen en contractmix heronderhandelen",
    "analysis map neemt de verkeerde historische topaanbeveling over"
  );
  assert(
    analysisMap.recommendedOption === "Kern beschermen en contractmix heronderhandelen",
    "analysis map gebruikt outcome-ranking niet als fallback voor aanbevolen keuze"
  );
  console.log("sector recommendation ranking regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
