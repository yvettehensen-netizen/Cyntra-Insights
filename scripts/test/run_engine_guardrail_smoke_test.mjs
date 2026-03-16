#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundleGuardrails(repoRoot) {
  const entry = path.join(repoRoot, "src/aurelius/engine/EngineGuardrails.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "guardrails-test-"));
  const outFile = path.join(outDir, "guardrails.mjs");
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
  const guardrails = await bundleGuardrails(repoRoot);
  const { safeStep, ensureSessionIntegrity, ensureReportIntegrity } = guardrails;
  const result = await safeStep("dummyStep", async () => {
    throw new Error("boom");
  });
  assert(result === null, "safeStep must swallow failures");

  const session = {
    session_id: "guard-1",
    organization_id: "org",
    status: "running",
    board_report: "exists",
  };
  ensureSessionIntegrity(session);
  assert(session.status === "completed", "session should end up completed when report exists");

  const emptySession = {
    session_id: "guard-2",
    organization_id: "org",
    status: "running",
  };
  ensureReportIntegrity(emptySession);
  assert(emptySession.strategic_report, "report must be created when missing");

  console.log("ENGINE GUARDRAIL SMOKE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
