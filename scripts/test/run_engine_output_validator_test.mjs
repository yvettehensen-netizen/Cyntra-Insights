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
  const { validateEngineOutput } = await bundleModule(
    repoRoot,
    "src/aurelius/validation/EngineOutputValidator.ts",
    "engine-output-validator-test"
  );

  const validated = validateEngineOutput({});

  assert(validated.executive_summary, "executive_summary ontbreekt");
  assert(validated.board_memo, "board_memo ontbreekt");
  assert(validated.strategic_conflict, "strategic_conflict ontbreekt");
  assert(validated.recommended_option, "recommended_option ontbreekt");
  assert(Array.isArray(validated.interventions), "interventions ontbreekt");

  console.log("Output validator werkt");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
