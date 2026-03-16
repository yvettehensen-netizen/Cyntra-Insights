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
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "analysis-report-flow"
  );

  const { platformApiBridge } = bridgeModule;
  assert(platformApiBridge?.runAnalysis, "runAnalysis ontbreekt.");

  const org = await platformApiBridge.upsertOrganization({
    organisatie_naam: "Molendrift",
    sector: "Zorg/GGZ",
    organisatie_grootte: "100-120 medewerkers",
    abonnementstype: "Professional",
  });

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: org.organization_id,
    input_data:
      "Molendrift werkt met een 70/30-model, groeit beperkt, gebruikt wachttijdtriage en wil via netwerkreplicatie schalen.",
    analysis_type: "Strategische analyse",
  });

  assert(analysis?.reportId, "rapport is niet opgeslagen");
  assert(analysis?.result?.executive_summary, "gevalideerde output ontbreekt");

  globalThis.localStorage.removeItem("cyntra_platform_analysis_sessions_v1");

  const report = await platformApiBridge.getReport(analysis.reportId);
  assert(report?.board_report, "rapport kan niet opnieuw geladen worden na sessieverlies");
  assert(report?.executive_summary, "rapport mist executive_summary na sessieverlies");

  console.log("analysis report flow regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
