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

async function bundleModule(repoRoot, entryPath, prefix) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const outFile = path.join(outDir, "bundle.mjs");
  await build({
    entryPoints: [path.join(repoRoot, entryPath)],
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
  const platform = await bundleModule(repoRoot, "src/platform/index.ts", "analysis-smoke-platform");
  const bridge = await bundleModule(repoRoot, "src/pages/portal/saas/usePlatformApiBridge.ts", "analysis-smoke-bridge");

  const { AnalysisSessionManager, isSessionCompleted } = platform;
  const { listReportSessions, resolveSessionForOutput } = bridge;

  assert(typeof AnalysisSessionManager === "function", "AnalysisSessionManager ontbreekt.");
  assert(typeof listReportSessions === "function", "Portal bridge ontbreekt.");
  assert(typeof resolveSessionForOutput === "function", "Portal output helper ontbreekt.");

  const manager = new AnalysisSessionManager();
  const created = manager.createSession({
    organization_id: "analysis-smoke-org",
    organization_name: "Smoke Test Org",
    input_data: "Context: snelle test voor analyseflow. Focus op strategie, conflict en besluit.",
    analysis_type: "Strategische analyse",
  });

  const completed = await manager.runSession({
    session_id: created.session_id,
    organization_name: created.organization_name,
    sector: "Zorg/GGZ",
    current_session: created,
  });

  assert(
    isSessionCompleted(completed.status),
    `Analysestatus moet completed zijn, kreeg ${completed.status}`
  );
  assert(
    String(completed.board_report || completed.strategic_report?.report_body || "").trim(),
    "Analyse zonder board report."
  );

  const reports = await listReportSessions({ includeArchived: false });
  assert(
    reports.some((row) => row.session_id === completed.session_id),
    "Portal listing mist de recente sessie."
  );

  const restored = await resolveSessionForOutput(completed.session_id);
  assert(restored, "Portal kon sessie niet herstellen.");
  assert(
    String(restored.board_report || restored.strategic_report?.report_body || "").trim(),
    "Herstelde sessie mist rapportinhoud."
  );

  console.log("ANALYSIS ENGINE OK");
  console.log("SESSION COMPLETED");
  console.log("REPORT RETRIEVED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
