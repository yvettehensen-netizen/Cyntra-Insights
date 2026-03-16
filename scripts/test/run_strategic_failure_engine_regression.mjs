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
  await build({
    entryPoints: [path.join(repoRoot, entryFile)],
    outfile: outFile,
    format: "esm",
    platform: "node",
    target: ["node20"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const module = await bundleModule(
    repoRoot,
    "src/aurelius/core/StrategicFailureEngine.ts",
    "strategic-failure-engine"
  );

  const { StrategicFailureEngine } = module;
  const engine = new StrategicFailureEngine();
  const points = engine.run({
    strategy: "Brede ambulante specialist blijven",
    options: [
      "Brede ambulante specialist blijven",
      "Selectieve specialisatie / niche kiezen",
      "Consortiumstrategie verdiepen",
    ],
    dominantRisk: "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding",
    sourceText:
      "Jeugdzorg ZIJN werkt met consortiumtriage, gemeentelijke contracten, budgetdruk en personeelsschaarste.",
  });

  assert(points.length >= 3, "StrategicFailureEngine genereert minder dan 3 breukpunten");
  for (const point of points) {
    assert(point.mechanism, "Breukpunt mist mechanisme");
    assert(point.systemPressure, "Breukpunt mist systeemdruk");
    assert(point.boardTest, "Breukpunt mist bestuurlijke test");
  }
  assert(
    points.some((point) => /gemeent|consortium|personeel/i.test(`${point.systemPressure} ${point.risk}`)),
    "Breukpunten missen sectorspecifieke druk"
  );

  console.log("strategic failure engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
