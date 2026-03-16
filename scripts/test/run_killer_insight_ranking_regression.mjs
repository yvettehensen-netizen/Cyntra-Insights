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
    "killer-ranking"
  );
  const { platformApiBridge } = bridgeModule;

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-killer-ranking-zijn",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke inkoop en contractruimte.
Contractplafonds, budgetdruk en wachttijden zetten tegelijk druk op marge, teamstabiliteit en doorstroom.
Het bestuur houdt meerdere richtingen tegelijk open, waardoor besluitvertraging en governancefrictie ontstaan.
Personeelsschaarste en administratieve belasting verlagen de effectieve capaciteit.
`.trim(),
  });

  const boardReport = String(analysis?.session?.board_report || "");
  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(typeof analysis?.result?.executive_summary === "string", "analyseflow mist executive summary contract");

  if (boardReport) {
    const insightsBlockMatch = boardReport.match(
      /###\s*NIEUWE INZICHTEN \(KILLER INSIGHTS\)\s*([\s\S]*?)(?:\n5\.\s+Aanbevolen keuze|\n\d+\.\s+Aanbevolen keuze|$)/i
    );
    const insightsBlock = String(insightsBlockMatch?.[1] || "");
    assert(insightsBlock.length > 0, "killer insights blok ontbreekt in board report");
    assert(
      /contract|budgetdruk|besluit|governance|wachttijd|capaciteit/i.test(insightsBlock),
      "killer insights missen bestuurlijke risicosignalen"
    );
  }

  console.log("killer insight ranking regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
