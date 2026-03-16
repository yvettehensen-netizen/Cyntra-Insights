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

async function loadPlatformRuntime(repoRoot) {
  const entry = path.join(repoRoot, "src/platform/index.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "analysis-finalize-recovery-"));
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
  const { AnalysisSessionManager, isSessionCompleted } = platform;

  const sessions = new AnalysisSessionManager();
  const created = sessions.createSession({
    organization_id: "org-regression",
    organization_name: "Regression Org",
    input_data: "Molendrift wil schalen via netwerkreplicatie zonder cultuurverlies.",
    analysis_type: "Strategische analyse",
  });

  const originalUpdateSession = sessions.updateSession.bind(sessions);
  let updateCalls = 0;
  sessions.updateSession = (...args) => {
    updateCalls += 1;
    if (updateCalls >= 2) {
      globalThis.localStorage.removeItem("cyntra_platform_analysis_sessions_v1");
      return null;
    }
    return originalUpdateSession(...args);
  };

  const completed = await sessions.runSession({
    session_id: created.session_id,
    organization_name: "Regression Org",
    sector: "Zorg/GGZ",
    current_session: created,
  });

  assert(isSessionCompleted(completed.status), "finale sessieherstel heeft status niet behouden");
  assert(completed.board_report, "board_report ontbreekt na finale sessieherstel");
  assert(completed.executive_summary, "executive_summary ontbreekt na finale sessieherstel");

  console.log("analysis finalize session recovery regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
