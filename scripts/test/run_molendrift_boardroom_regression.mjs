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

async function loadPlatformRuntime(repoRoot) {
  const entry = path.join(repoRoot, "src/platform/index.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "molendrift-regression-"));
  const outFile = path.join(outDir, "platform.mjs");

  await build({
    entryPoints: [entry],
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
  const platform = await loadPlatformRuntime(repoRoot);
  const { SaaSPlatformFacade, isSessionCompleted } = platform;
  assert(typeof SaaSPlatformFacade === "function", "SaaSPlatformFacade ontbreekt.");

  const source = [
    "Molendrift is een platte organisatie zonder middenmanagement.",
    "Medewerkers zijn mede-eigenaar via aandelen en eigenaarschap is cruciaal voor kwaliteit.",
    "Cultuur en retentie zijn de kern van het behandelmodel.",
    "Groei wordt bewust begrensd op maximaal 5 FTE per jaar om cultuurkwaliteit te beschermen.",
    "De organisatie wil maatschappelijke impact vergroten via netwerkorganisatie, partners en modeladoptie.",
    "RUG levert een talentpipeline en de uitstroom blijft laag.",
    "De bestuursvraag is hoe impact groeit zonder het eigenaarschapsmechanisme te breken.",
  ].join("\n");

  const facade = new SaaSPlatformFacade();
  const org = facade.ensureOrganization({
    organisatie_naam: "Molendrift",
    sector: "GGZ",
    organisatie_grootte: "120 medewerkers",
    abonnementstype: "Professional",
  });

  const session = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: source,
    analysis_type: "Strategische analyse",
  });

  assert(isSessionCompleted(session.status), "Analyse is niet voltooid.");
  assert((session.quality_score || 0) >= 85, "Kwaliteitsscore onder publicatiedrempel.");
  const flags = Array.isArray(session.quality_flags) ? session.quality_flags : [];
  assert(!flags.includes("contains_placeholder_artifacts"), "Placeholder-artifacts zijn nog aanwezig.");
  assert(!flags.includes("contains_unresolved_tokens"), "Unresolved tokens zijn nog aanwezig.");

  const summary = String(session.executive_summary || "");
  assert(/Professional Partnership/i.test(summary), "Executive summary mist Professional Partnership.");
  assert(!/klassiek organisatiemodel|Classical Hierarchy/i.test(summary), "Executive summary lekt nog klassiek patroon.");

  const memo = String(session.board_memo || "");
  assert(/Bestuurlijke hypothese/i.test(memo), "Board memo mist bestuurlijke hypothese.");
  assert(/Feitenbasis/i.test(memo), "Board memo mist feitenbasis.");
  assert(/Open vragen/i.test(memo), "Board memo mist open vragen.");

  console.log("molendrift boardroom regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
