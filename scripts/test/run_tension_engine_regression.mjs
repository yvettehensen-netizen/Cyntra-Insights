#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

async function bundleModule(repoRoot, entryFile, prefix) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const outFile = path.join(outDir, "bundle.mjs");
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
  const testModule = await bundleModule(repoRoot, "tests/strategy/tension_engine.test.ts", "tension-engine-test");
  const reportModule = await bundleModule(repoRoot, "src/aurelius/engine/buildStrategicBrainReport.ts", "strategic-brain-report");

  testModule.runTensionEngineTest();

  const report = reportModule.buildStrategicBrainReport({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    inputText: `
Jeugdzorg ZIJN werkt voor circa 35 gemeenten met verschillende tarieven, reistijd en no-show-regels.
Instroom loopt deels via consortium en Haarlem toegangspoort.
Teams bestaan grotendeels uit vaste medewerkers, werkplezier is hoog en uitstroom laag.
Groei gebeurt voorzichtig via vaste teams en een flexibele schil.
Caseload en wachttijd bepalen of de organisatie uitvoerbaar en rendabel blijft.
`.trim(),
  });

  if (!/portfolio breadth versus operational capacity/i.test(report.executive_decision_card.strategic_tension)) {
    throw new Error("strategic brain report mist portfolio-capaciteitsspanning");
  }
  if (!report.board_analysis.scenario_comparison.some((item) => /Gemeentenportfolio rationaliseren/i.test(item.title))) {
    throw new Error("board analysis mist portfolio-scenario");
  }
  if (!report.execution_layer.strategic_actions.some((item) => /gemeentenmatrix/i.test(item.action))) {
    throw new Error("execution layer mist gemeentenmatrix");
  }
  if (!/youth-care-portfolio-capacity/i.test(report.institutional_memory.references[0]?.id || "")) {
    throw new Error("institutional memory verwijst niet naar jeugdzorg seed-pattern");
  }

  console.log("tension engine regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
