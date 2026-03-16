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
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ggz-quality-regression-"));
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

  const sourcePath = path.join(repoRoot, "scripts/test/fixtures/ggz_voor_jou_source.txt");
  const source = fs.readFileSync(sourcePath, "utf8");
  const facade = new SaaSPlatformFacade();

  const org = facade.ensureOrganization({
    organisatie_naam: "GGZ Voor Jou",
    sector: "Zorg/GGZ",
    organisatie_grootte: "25 medewerkers",
    abonnementstype: "Professional",
  });

  const session = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: source,
    analysis_type: "Strategische analyse",
  });

  assert(isSessionCompleted(session.status), "Analyse is niet voltooid.");
  assert((session.analysis_runtime_ms || 0) >= 12000, "Runtime gate faalt (<12s).");
  assert((session.engine_mode || "") === "local-deterministic", "Onjuiste engine_mode.");
  assert((session.quality_score || 0) >= 80, "Kwaliteitsscore onder premium-drempel.");
  assert((session.quality_tier || "") === "premium", "Kwaliteitstier is niet premium.");

  const memo = String(session.board_memo || "");
  assert(/Bestuurlijke hypothese/i.test(memo), "Hypothese-sectie ontbreekt in board memo.");
  assert(/Feitenbasis/i.test(memo), "Feitenbasis-sectie ontbreekt in board memo.");
  assert(/Besluitvoorstel/i.test(memo), "Besluitvoorstel-sectie ontbreekt in board memo.");
  assert(!/OUTPUT 1\b/i.test(memo), "Board memo bevat nog OUTPUT 1 dump.");
  assert(!/CONTEXT LAYER|DIAGNOSIS LAYER|MECHANISM LAYER|DECISION LAYER/i.test(memo), "Board memo bevat nog layer dump.");
  assert(!/HGBCO/i.test(memo), "HGBCO mag niet zichtbaar zijn in front-output.");

  const summary = String(session.executive_summary || "");
  assert(/Loonkosten stijgen >5%/i.test(summary), "Executive summary mist bronspecifieke feiten.");

  const report = String(session.board_report || "");
  assert(/Niet-onderhandelbare besluitregels/i.test(report), "Rapport mist besluitregels-sectie.");
  assert(!/BOARD MEMO \(HGBCO\)/i.test(report), "HGBCO mag niet zichtbaar zijn in rapport-output.");
  assert(/NIEUWE INZICHTEN \(KILLER INSIGHTS\)/i.test(report), "Killer insights-sectie ontbreekt.");
  assert((report.match(/\n\d+\.\sActie:/g) || []).length >= 15, "90-dagen plan bevat minder dan 15 acties.");
  assert(/WIJ BESLUITEN:/i.test(report), "Rapport mist verplichte besluitafsluiting.");
  assert(/EUR 160\.000/i.test(report), "Rapport mist kernfeit EUR 160.000.");

  const interventions = (session.intervention_predictions || []).map((row) => String(row.interventie || "").toLowerCase());
  assert(!interventions.includes("strategische interventie"), "Generieke interventie lekt nog door.");
  assert(!interventions.includes("onvoldoende historiek"), "Onvoldoende-historiek interventie lekt nog door.");
  const pipeline = session?.strategic_agent?.pipeline || [];
  assert(Array.isArray(pipeline) && pipeline.length >= 8, "Strategische pipeline ontbreekt of is onvolledig.");
  assert(pipeline.includes("ContextEngine") && pipeline.includes("NarrativeGenerator"), "Verplichte pipeline-stappen ontbreken.");

  const manager = facade.sessions;
  const second = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: `${source}\n\nExtra case voor archivering.`,
    analysis_type: "Strategische analyse",
  });
  assert(isSessionCompleted(second.status), "Tweede analyse mislukt.");
  const archiveResult = manager.archiveLegacySessions(1);
  assert(archiveResult.archived >= 1, "Archivering van oude sessies faalt.");

  console.log("ggz quality regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
