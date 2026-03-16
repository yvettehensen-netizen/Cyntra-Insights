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
  const storage = {
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
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage };
}

async function bundleModule(repoRoot, entryFile, prefix) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const outFile = path.join(outDir, "bundle.mjs");
  await build({
    entryPoints: [path.join(repoRoot, entryFile)],
    outfile: outFile,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  installMemoryStorage();

  const pipelineModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/boardroom/runBoardroomPipeline.ts",
    "decision-consequence-pipeline"
  );
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "decision-consequence-report"
  );

  const { runBoardroomPipeline } = pipelineModule;
  const { platformApiBridge } = bridgeModule;

  const pipeline = runBoardroomPipeline({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    inputText: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke contracten, ervaart wachtdruk en personeelsschaarste
en wil kiezen tussen verbreding en scherpere specialisatie.
`.trim(),
  });

  const decisionConsequences =
    pipeline.state.outputs.DecisionConsequenceModule?.data?.decisionConsequences;
  assert(decisionConsequences, "decision consequence module output ontbreekt");
  for (const field of ["decision", "horizon12m", "horizon24m", "horizon36m", "strategicOutcome", "riskIfWrong"]) {
    assert(
      typeof decisionConsequences[field] === "string" && decisionConsequences[field].trim().length > 0,
      `decision consequence veld ontbreekt: ${field}`
    );
  }

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn-consequences",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is een kleinschalige jeugdzorgorganisatie in Haarlem.
De organisatie is afhankelijk van gemeentelijke contracten en kampt met wachttijden, budgetdruk en personeelstekorten.
Het bestuur moet kiezen tussen verbreding en scherpere focus op specialistische jeugdhulp.
`.trim(),
  });

  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(typeof analysis?.result?.recommended_option === "string", "analyseflow mist core aanbevolen keuze");

  console.log("decision consequence regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
