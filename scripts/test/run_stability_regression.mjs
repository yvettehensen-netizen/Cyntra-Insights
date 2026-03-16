#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const TEST_ENTRIES = [
  "tests/engine/engine-contracts.test.ts",
  "tests/engine/dataset-pipeline.test.ts",
  "tests/engine/performance-check.test.ts",
  "tests/rapport/report-structure.test.ts",
  "tests/rapport/strategic-report-rendering.test.ts",
];

function projectRoot() {
  const thisFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(thisFile), "../..");
}

async function runEntry(entry, outDir, cwd) {
  const outputFile = path.join(outDir, `${path.basename(entry, ".ts")}.mjs`);
  await build({
    absWorkingDir: cwd,
    entryPoints: [entry],
    outfile: outputFile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    tsconfig: "tsconfig.json",
    logLevel: "silent",
  });

  const module = await import(pathToFileURL(outputFile).href);
  if (typeof module.run !== "function") {
    throw new Error(`Test entry mist run(): ${entry}`);
  }
  await module.run();
}

async function main() {
  const cwd = projectRoot();
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "cyntra-stability-tests-"));

  for (const entry of TEST_ENTRIES) {
    await runEntry(entry, outDir, cwd);
  }

  console.log(`stability regression tests passed (${TEST_ENTRIES.length})`);
}

main().catch((error) => {
  console.error("stability regression failed");
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
