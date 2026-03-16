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
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "quality-gate-regression-"));
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
  const sessionManagerSource = fs.readFileSync(
    path.join(repoRoot, "src/platform/AnalysisSessionManager.ts"),
    "utf8"
  );
  assert(/contains_placeholder_artifacts/.test(sessionManagerSource), "Placeholder-artifact flag ontbreekt in scorer.");
  assert(/contains_unresolved_tokens/.test(sessionManagerSource), "Unresolved-token flag ontbreekt in scorer.");
  assert(/open_questions_empty/.test(sessionManagerSource), "Open-vragen flag ontbreekt in scorer.");
  assert(/criticalPublicationFlags/.test(sessionManagerSource), "Critical-publication gate ontbreekt.");

  installMemoryStorage();
  const platform = await loadPlatformRuntime(repoRoot);
  const { SaaSPlatformFacade, isSessionCompleted } = platform;
  assert(typeof SaaSPlatformFacade === "function", "SaaSPlatformFacade ontbreekt.");

  const facade = new SaaSPlatformFacade();
  const org = facade.ensureOrganization({
    organisatie_naam: "Molendrift",
    sector: "GGZ",
    organisatie_grootte: "100-120 medewerkers",
    abonnementstype: "Professional",
  });

  const source = [
    "Molendrift werkt met 70% zorg en 30% ontwikkelprojecten.",
    "Groei is begrensd op maximaal 5 FTE per jaar.",
    "Vergrijzing verhoogt loonkosten met circa 30%.",
    "Wachttijdexperimenten leiden tot kortere trajecten en 8% uitstroom via kort pad.",
    "Netwerkstrategie en licentieproducten moeten impact vergroten zonder lineaire volumegroei.",
    "Ziekteverzuim ligt rond 5%.",
  ].join("\n");

  const session = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: source,
    analysis_type: "Strategische analyse",
  });

  assert(isSessionCompleted(String(session.status || "")), "Analyse eindigde in onverwachte status.");
  assert(String(session.board_report || "").trim(), "Analyse leverde geen board_report op.");
  const flags = Array.isArray(session.quality_flags) ? session.quality_flags : [];
  assert(!flags.includes("contains_placeholder_artifacts"), "Analyse bevat nog placeholder-artifacts.");
  assert(!flags.includes("contains_unresolved_tokens"), "Analyse bevat nog unresolved tokens.");
  assert(!flags.includes("open_questions_empty"), "Analyse mist nog open vragen.");
  if (Number(session.quality_score || 0) < 85) {
    assert(
      /Publicatie waarschuwing|Analysekwaliteit onder publicatiedrempel/i.test(String(session.error_message || "")),
      "Lage kwaliteit wordt niet als waarschuwing vastgelegd."
    );
  }

  console.log("quality gate placeholder regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
