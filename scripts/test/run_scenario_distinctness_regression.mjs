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
  const { scenarioDistinctnessCheck } = await bundleModule(
    repoRoot,
    "src/aurelius/validators/scenario_distinctness_check.ts",
    "scenario-distinctness"
  );
  const map = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_analysis_map.json"), "utf8")
  );
  const result = scenarioDistinctnessCheck(map);
  assert(result.pass, `scenario distinctness faalt: ${result.issues.join(", ")}`);
  console.log("scenario distinctness regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
