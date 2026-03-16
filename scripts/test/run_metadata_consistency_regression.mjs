#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundleModule(repoRoot, entryFile, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
  await build({ entryPoints: [path.join(repoRoot, entryFile)], outfile: outFile, format: "esm", platform: "node", target: ["node20"], bundle: true, sourcemap: false, logLevel: "silent" });
  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const fixture = fs.readFileSync(
    path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_boardroom_golden.md"),
    "utf8"
  );
  const map = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_analysis_map.json"), "utf8")
  );
  const { metadataConsistencyCheck } = await bundleModule(
    repoRoot,
    "src/aurelius/validators/metadata_consistency_check.ts",
    "metadata-consistency"
  );
  const result = metadataConsistencyCheck(fixture, map);
  assert(result.pass, `metadata consistency faalt: ${result.mismatches.join(", ")}`);
  console.log("metadata consistency regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
