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
    "missing-organization-recovery"
  );
  const { platformApiBridge } = bridgeModule;

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-missing-regression",
    organization_name: "Molendrift",
    sector: "Zorg/GGZ",
    organisatie_grootte: "100-120 medewerkers",
    abonnementstype: "Professional",
    input_data: "Molendrift gebruikt een 70/30-model, bewaakt cultuur en schaalt via netwerkreplicatie.",
    analysis_type: "Strategische analyse",
  });

  assert(analysis?.reportId, "reportId ontbreekt na organisatieherstel");
  assert(analysis?.session?.organization_id === "org-missing-regression", "organization_id moet behouden blijven");
  assert(analysis?.session?.organization_name === "Molendrift", "organization_name moet hersteld worden");

  const organizations = await platformApiBridge.listOrganizations();
  const restored = organizations.find((row) => row.organization_id === "org-missing-regression");
  assert(restored, "organisatie is niet automatisch hersteld");

  console.log("missing organization recovery regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
