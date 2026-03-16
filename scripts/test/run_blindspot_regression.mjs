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
    "blindspot-pipeline"
  );
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "blindspot-report"
  );

  const { runBoardroomPipeline } = pipelineModule;
  const { platformApiBridge } = bridgeModule;

  const boardroomPipeline = runBoardroomPipeline({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    inputText: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke contracten en ervaart tariefdruk, wachttijden en personeelstekorten.
De organisatie overweegt verbreding, maar heeft beperkte bestuurlijke capaciteit en hoge administratieve belasting.
Gemeenten sturen op kosten en specialisatie; teamstabiliteit staat onder druk.
`.trim(),
  });

  const pipelineBlindSpots =
    boardroomPipeline.state.outputs.BlindSpotDetectorModule?.data?.blindSpots;
  assert(Array.isArray(pipelineBlindSpots), "blind spot module output ontbreekt in boardroom pipeline");
  assert(pipelineBlindSpots.length >= 3, "boardroom pipeline genereert minder dan 3 blind spots");

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn-blindspots",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is een kleinschalige jeugdzorgorganisatie in Haarlem.
De organisatie is afhankelijk van gemeentelijke inkoop, ervaart budgetdruk, tariefdruk, wachttijden en personeelstekorten.
Er is discussie over verbreding versus specialisatie, terwijl contractruimte, positionering en bestuurlijke focus onder druk staan.
Samenwerking met scholen, wijkteams en ketenpartners is nodig, maar governance en prioritering zijn nog diffuus.
`.trim(),
  });

  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(typeof analysis?.result?.executive_summary === "string", "analyseflow mist core output contract");

  console.log("blind spot regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
