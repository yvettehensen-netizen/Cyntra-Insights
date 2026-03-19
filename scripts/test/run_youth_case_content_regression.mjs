#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { validateReport } from "./report_quality_guard.mjs";

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
    "youth-case-content"
  );

  const { platformApiBridge } = bridgeModule;

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is een jeugdzorgorganisatie in Haarlem.
De organisatie is afhankelijk van gemeentelijke inkoop sinds de Jeugdwet.
Belangrijke thema's: wachttijden, personeelstekorten, complexere problematiek, budgetdruk en bureaucratische verantwoordingsdruk.
Sterktes: lokale aanwezigheid, kleinschaligheid, sterke relatie met gezinnen.
Zwaktes: afhankelijkheid van gemeentelijke contracten, beperkte investeringskracht.
Kansen: ambulante begeleiding, samenwerking met scholen en wijkteams, preventieve gezinsbegeleiding.
Bedreigingen: gemeenten die contracten verminderen, concurrentie van grotere zorgorganisaties.
Strategische vragen: positionering, contractering, behoud van professionals, systeemgerichte hulp.
`.trim(),
  });

  const canonicalReport = analysis?.report;
  assert(canonicalReport, "canonical report ontbreekt");
  validateReport(canonicalReport);

  const executiveSummary =
    String(analysis?.result?.executive_summary || canonicalReport.executiveCore || "");
  assert(executiveSummary.length > 60, "executive summary te kort");
  assert(canonicalReport.scenarios.length >= 3, "scenario analyse te klein");
  assert(canonicalReport.mechanismAnalysis, "mechanisme analyse ontbreekt");
  assert(canonicalReport.strategicTension, "strategische spanning ontbreekt");

  const narrativeParagraphs = [
    canonicalReport.executiveCore,
    canonicalReport.decisionQuestion,
    canonicalReport.situation,
    canonicalReport.mechanismAnalysis?.explanation,
    canonicalReport.strategicTension?.explanation,
  ]
    .filter(Boolean)
    .map((paragraph) => paragraph.trim());

  narrativeParagraphs.forEach((paragraph) => {
    assert(paragraph.length > 60, "narrative paragraph te kort");
  });
  console.log("youth case content regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
