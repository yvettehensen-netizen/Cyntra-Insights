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

  const nodeModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/nodes/strategy/StrategicMemoryNode.ts",
    "memory-node"
  );
  const storeModule = await bundleModule(
    repoRoot,
    "src/aurelius/memory/StrategicMemoryStore.ts",
    "memory-store"
  );
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "memory-report"
  );

  const { runStrategicMemoryNode } = nodeModule;
  const { StrategicMemoryStore } = storeModule;
  const { platformApiBridge } = bridgeModule;

  const store = new StrategicMemoryStore();
  const output1 = runStrategicMemoryNode({
    memoryId: "case-1",
    sector: "Jeugdzorg",
    organizationType: "kleinschalige zorgorganisatie",
    dominantProblem: "contractdruk",
    recommendedChoice: "specialisatie boven volumegroei",
    facts: ["Gemeentelijke contractdruk", "Personeelsschaarste"],
    interventions: ["triageprotocol", "specialisatie in complexe casussen"],
    strategicLeverage: [
      {
        title: "Contractdiscipline",
        mechanism: "contractstructuur bepaalt schaalruimte",
        why80_20: "beïnvloedt marge en wachtdruk tegelijk",
        boardAction: "margevloer vaststellen",
        expectedEffect: "stabielere capaciteit",
      },
    ],
  });
  assert(output1.storedPattern.memoryId === "case-1", "memory node slaat eerste case niet op");

  const output2 = runStrategicMemoryNode({
    memoryId: "case-2",
    sector: "Jeugdzorg",
    organizationType: "kleinschalige zorgorganisatie",
    dominantProblem: "contractdruk",
    recommendedChoice: "specialisatie boven volumegroei",
    facts: ["Gemeentelijke contractdruk", "Wachtdruk"],
    interventions: ["triageprotocol", "netwerkmodel met partners"],
    strategicLeverage: [
      {
        title: "Intake triage",
        mechanism: "triage beïnvloedt wachtdruk en caseload",
        why80_20: "beïnvloedt meerdere variabelen",
        boardAction: "wekelijkse triagebesluiten",
        expectedEffect: "lagere wachttijd",
      },
    ],
  });

  assert(store.listStrategicPatterns().length >= 2, "StrategicMemoryStore bewaart patronen niet");
  assert(output2.strategicMemory.similarPatterns.trim().length > 0, "StrategicMemoryNode genereert geen similarPatterns");
  assert(output2.strategicMemory.strategicWarning.trim().length > 0, "StrategicMemoryNode genereert geen strategicWarning");

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn-memory",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke contracten, ervaart wachttijden, personeelstekorten en budgetdruk.
De organisatie overweegt specialisatie en netwerkvorming als alternatief voor volumegroei.
`.trim(),
  });

  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(typeof analysis?.result?.board_memo === "string", "analyseflow mist gevalideerde board memo");

  console.log("memory engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
