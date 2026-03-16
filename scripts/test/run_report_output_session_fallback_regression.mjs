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

  const platform = await bundleModule(repoRoot, "src/platform/index.ts", "report-output-fallback-platform");
  const bridge = await bundleModule(repoRoot, "src/pages/portal/saas/usePlatformApiBridge.ts", "report-output-fallback-bridge");
  const reportStorage = await bundleModule(repoRoot, "src/services/reportStorage.ts", "report-output-fallback-storage");

  const { SaaSPlatformFacade, ReportDeliveryService } = platform;
  const { resolveSessionForOutput, listReportSessions, getLatestReportSession } = bridge;
  const { saveReport } = reportStorage;

  assert(typeof SaaSPlatformFacade === "function", "SaaSPlatformFacade ontbreekt.");
  assert(typeof resolveSessionForOutput === "function", "resolveSessionForOutput ontbreekt.");
  assert(typeof listReportSessions === "function", "listReportSessions ontbreekt.");
  assert(typeof getLatestReportSession === "function", "getLatestReportSession ontbreekt.");

  const source = [
    "Organisatiecultuur en Eigenaarschap: medewerkers besteden 70% van hun tijd aan zorg en 30% aan ontwikkelprojecten.",
    "Beperkte groei en vergrijzing: groei maximaal 5 FTE per jaar; vergrijzing verhoogt loonkosten met 30%.",
    "Zorgverlening en Wachttijdbeheer: kortere trajecten verminderen wachttijden en verbeteren tevredenheid.",
    "Financiële en Strategische Positionering: Molendrift werkt met vrijwel alle verzekeraars in Noord-Nederland.",
    "Beweging van Nul: activiteiten gericht op jeugdbeleid om uithuisplaatsingen te verminderen.",
    "Leiderschap en Talentmanagement: ziekteverzuim circa 5% met aandacht voor werkplezier.",
  ].join("\n");

  const facade = new SaaSPlatformFacade();
  const org = facade.ensureOrganization({
    organisatie_naam: "Molendrift",
    sector: "Zorg/GGZ",
    organisatie_grootte: "100-120 medewerkers",
    abonnementstype: "Professional",
  });

  const session = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: source,
    analysis_type: "Strategische analyse",
  });

  assert(session.session_id, "session_id ontbreekt");
  assert(session.strategic_report?.report_body || session.board_report, "board_report ontbreekt");

  saveReport(
    session.session_id,
    session.strategic_report || {
      report_id: `report-${session.session_id}`,
      session_id: session.session_id,
      organization_id: org.organization_id,
      title: `Cyntra Executive Dossier — Molendrift — ${session.session_id}`,
      sections: [],
      generated_at: session.updated_at || session.analyse_datum,
      report_body: session.board_report,
    }
  );

  globalThis.localStorage.removeItem("cyntra_platform_analysis_sessions_v1");

  const reportSessions = await listReportSessions({ includeArchived: false });
  assert(reportSessions.some((row) => row.session_id === session.session_id), "rapport ontbreekt in report-first listing");

  const recovered = await resolveSessionForOutput(session.session_id);
  assert(recovered, "sessie kan niet worden hersteld vanuit opgeslagen rapport");
  assert(recovered?.board_report?.includes("BESTUURLIJKE ANALYSE") || recovered?.board_report?.includes("1. Besluitvraag"), "herstelde sessie mist rapportinhoud");
  assert(recovered?.executive_summary, "herstelde sessie mist executive_summary");
  assert(recovered?.board_memo, "herstelde sessie mist board_memo");

  const latest = await getLatestReportSession();
  assert(latest?.session_id === session.session_id, "latest report wijst niet naar opgeslagen rapport");

  const delivery = new ReportDeliveryService();
  const executive = delivery.createExecutiveSummary(recovered);
  const memo = delivery.createBoardMemo(recovered);
  const pdf = await delivery.createPdf(recovered);

  assert(executive.content, "executive summary fallback ontbreekt");
  assert(memo.content, "board memo fallback ontbreekt");
  assert(pdf.content, "pdf fallback ontbreekt");

  console.log("report output session fallback regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
