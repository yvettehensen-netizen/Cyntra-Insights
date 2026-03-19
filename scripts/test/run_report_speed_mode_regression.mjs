#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  const modeModule = await bundleModule(repoRoot, "src/components/reports/reportSpeedMode.ts", "report-speed-mode");
  const pathModule = await bundleModule(repoRoot, "src/pages/portal/portalPaths.ts", "report-speed-paths");

  const {
    normalizeReportSpeedMode,
    getDefaultReportTabForMode,
    getVisibleReportTabsForMode,
    deriveReportSpeedModeFromTab,
    getReportModeHint,
  } = modeModule;
  const { buildPortalReportPath, buildPortalReportLibraryPath } = pathModule;

  assert(normalizeReportSpeedMode(undefined) === "short", "onbekende mode moet naar short vallen");
  assert(normalizeReportSpeedMode("full") === "full", "full mode wordt niet herkend");
  assert(getDefaultReportTabForMode("short") === "boardroom", "kort dossier moet boardroom standaard openen");
  assert(getDefaultReportTabForMode("full") === "strategy", "volledig dossier moet strategy standaard openen");
  assert(
    JSON.stringify(getVisibleReportTabsForMode("short")) === JSON.stringify(["boardroom"]),
    "kort dossier mag alleen boardroom tonen"
  );
  assert(
    JSON.stringify(getVisibleReportTabsForMode("full")) === JSON.stringify(["boardroom", "strategy", "scenario", "engine"]),
    "volledig dossier moet alle tabs tonen"
  );
  assert(deriveReportSpeedModeFromTab("engine") === "full", "engine tab moet full mode afdwingen");
  assert(/besluitinformatie|boardroomgebruik/i.test(getReportModeHint("short")), "short mode hint is niet scherp genoeg");
  assert(buildPortalReportPath("RPT-123", "full").endsWith("/portal/rapport/RPT-123?view=full"), "full route ontbreekt");
  assert(buildPortalReportPath("RPT-123", "short").endsWith("/portal/rapport/RPT-123"), "short route hoort schoon te blijven");
  assert(buildPortalReportLibraryPath("RPT-123", "full").includes("?session=RPT-123&view=full"), "library route mist full mode");

  const pageSource = fs.readFileSync(
    path.join(repoRoot, "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"),
    "utf8"
  );
  const boardroomViewSource = fs.readFileSync(
    path.join(repoRoot, "src/components/reports/BoardroomView.tsx"),
    "utf8"
  );
  assert(pageSource.includes("Kort dossier"), "rapportpagina mist kort dossier toggle");
  assert(pageSource.includes("Volledig dossier"), "rapportpagina mist volledig dossier toggle");
  assert(pageSource.includes("getVisibleReportTabsForMode(reportMode)"), "tabs worden niet op report mode gefilterd");
  assert(pageSource.includes('compact={reportMode === "short"}'), "boardroom view krijgt short dossier niet compact mee");
  assert(boardroomViewSource.includes('titleLabel="Decision cockpit"'), "kort dossier gebruikt nog een afwijkende boardroom-titel");

  console.log("report speed mode regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
