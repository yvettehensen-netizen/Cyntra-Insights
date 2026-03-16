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

async function bundleModule(repoRoot, entryFile, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
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
    "e2e-sector-bridge"
  );
  const scorerModule = await bundleModule(
    repoRoot,
    "src/aurelius/core/BoardMemoQualityScorer.ts",
    "board-memo-quality"
  );

  const { platformApiBridge } = bridgeModule;
  const { scoreBoardMemoQuality } = scorerModule;

  const cases = [
    {
      organization_name: "GGZ Voor Jou",
      sector: "GGZ",
      sourcePath: "scripts/test/fixtures/ggz_voor_jou_source.txt",
    },
    {
      organization_name: "Northline Advisory",
      sector: "B2B dienstverlening",
      sourcePath: "scripts/test/fixtures/b2b_dienstverlening_source.txt",
    },
    {
      organization_name: "SignalStack",
      sector: "SaaS",
      sourcePath: "scripts/test/fixtures/saas_scaleup_source.txt",
    },
  ];

  for (const item of cases) {
    const input = fs.readFileSync(path.join(repoRoot, item.sourcePath), "utf8");
    const analysis = await platformApiBridge.runAnalysis({
      organization_id: `org-${item.organization_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      organization_name: item.organization_name,
      sector: item.sector,
      organisatie_grootte: "Middelgroot",
      abonnementstype: "Professional",
      analysis_type: "Strategische analyse",
      input_data: input,
    });

    const boardMemo = String(analysis?.result?.board_memo || analysis?.session?.board_memo || "");
    const reportBody = String(analysis?.report?.report_body || analysis?.session?.board_report || "");
    assert(boardMemo.trim(), `${item.organization_name}: board memo ontbreekt`);
    assert(reportBody.trim(), `${item.organization_name}: rapport ontbreekt`);
    assert(!/Keuzedruk|HARD -|bron:|Kopieer richting|OUTPUT 1|CONTEXT LAYER/i.test(boardMemo), `${item.organization_name}: memo bevat artefacten`);

    const quality = scoreBoardMemoQuality(boardMemo);
    assert(quality.score >= 70, `${item.organization_name}: board memo quality te laag (${quality.score})`);
    assert(/Bestuurlijke hypothese/i.test(boardMemo), `${item.organization_name}: memo mist hypothese`);
    assert(/Besluitvoorstel/i.test(boardMemo), `${item.organization_name}: memo mist besluitvoorstel`);
  }

  console.log("end-to-end sector fixture regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
