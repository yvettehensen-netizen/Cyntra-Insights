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
    "strategic-memory-outcome"
  );
  const engine = new StrategicMemoryEngine();
  engine.storeCase({
    case_id: "case-1",
    created_at: "2026-03-12",
    organisatie_type: "zorg",
    sector: "Jeugdzorg",
    organisatiegrootte: "50",
    dominant_problem: "Contractgedreven instroom en triage zetten de kern onder druk",
    dominant_thesis: "Kern beschermen",
    mechanisms: ["contractdruk"],
    strategic_options: ["Brede ambulante specialist blijven"],
    gekozen_strategie: "Brede ambulante specialist blijven",
    interventieprogramma: "Triage standaardiseren",
    resultaat: "Wachtdruk daalde zichtbaar",
  });
  engine.linkOutcome("case-1", {
    outcome_id: "out-1",
    outcome_summary: "Wachttijd daalde onder 12 weken",
    outcome_score: "hoog",
    evaluation_date: "2026-06-01",
  });

  const insight = engine.trackOutcome("Contractgedreven instroom zet de kern onder druk");
  assert(insight.similarCases.length >= 1, "memory engine vindt geen vergelijkbare case");
  assert(/Wachttijd daalde onder 12 weken/i.test(insight.historicalOutcome), "linked outcome wordt niet teruggegeven");
  assert(
    insight.rankedRecommendations[0]?.recommendation === "Brede ambulante specialist blijven",
    "outcome ranking zet de verkeerde aanbeveling bovenaan"
  );
  console.log("memory outcome regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
