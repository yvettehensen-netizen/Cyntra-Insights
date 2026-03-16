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
    "leverage-pipeline"
  );
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "leverage-report"
  );

  const { runBoardroomPipeline } = pipelineModule;
  const { platformApiBridge } = bridgeModule;

  const pipeline = runBoardroomPipeline({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    inputText: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke contracten, ervaart wachtdruk en personeelstekorten,
en zoekt de kleinste ingrepen met de grootste impact op contractpositie, werkdruk en wachttijd.
`.trim(),
  });

  const strategicLeverage = pipeline.state.outputs.StrategicLeverageModule?.data?.strategicLeverage;
  assert(Array.isArray(strategicLeverage), "strategic leverage module output ontbreekt");
  assert(strategicLeverage.length >= 2, "strategic leverage module genereert minder dan 2 leverage points");

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn-leverage",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke inkoop en contracten.
Wachttijden, administratieve druk en personeelsschaarste zetten de organisatie onder druk.
Het bestuur zoekt de 1-2 ingrepen die marge, wachttijd en teamstabiliteit tegelijk verbeteren.
`.trim(),
  });

  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(Array.isArray(analysis?.result?.interventions), "analyseflow mist interventiecontract");

  console.log("leverage detector regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
