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

function normalize(text) {
  return String(text || "").trim().replace(/\r\n?/g, "\n");
}

function renderFixtureMarkdown(output) {
  const parts = [];
  parts.push("KERNSTELLING");
  parts.push(output.thesis);
  parts.push("");
  parts.push("DOORBRAAKINZICHTEN");
  output.insights.forEach((item, index) => {
    parts.push(`Inzicht ${index + 1}`);
    parts.push(`KERNINZICHT — ${item.insight}`);
    parts.push(`MECHANISME — ${item.mechanism}`);
    parts.push(`BESTUURLIJK GEVOLG — ${item.implication}`);
    parts.push("");
  });
  parts.push("BESTUURLIJK ACTIEPLAN");
  output.actions.forEach((item, index) => {
    parts.push(`Actie ${index + 1}`);
    parts.push(`ACTIE — ${item.action}`);
    parts.push(`MECHANISME — ${item.mechanism}`);
    parts.push(`BESTUURLIJK BESLUIT — ${item.boardDecision}`);
    parts.push(`KPI — ${item.kpi}`);
    parts.push("");
  });
  parts.push("SCENARIO'S");
  output.scenarios.forEach((item, index) => {
    parts.push(`Scenario ${index + 1}`);
    parts.push(`TITEL — ${item.title}`);
    parts.push(`MECHANISME — ${item.mechanism}`);
    parts.push(`RISICO — ${item.risk}`);
    parts.push(`BESTUURLIJKE IMPLICATIE — ${item.boardImplication}`);
    parts.push("");
  });
  return normalize(parts.join("\n"));
}

async function main() {
  const repoRoot = process.cwd();
  const pageModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/StrategischRapportSaaSPage.tsx",
    "jeugdzorg-board-fixture"
  );

  const sourcePath = path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_source.txt");
  const goldenPath = path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_board_document.golden.md");
  const sourceText = fs.readFileSync(sourcePath, "utf8");
  const expected = normalize(fs.readFileSync(goldenPath, "utf8"));

  const output = pageModule.buildJeugdzorgBoardGoldenFixture(sourceText);
  assert(output, "fixture helper gaf geen output terug");
  assert(output.thesis, "fixture mist kernstelling");
  assert(output.insights.length === 5, `verwacht 5 inzichten, kreeg ${output.insights.length}`);
  assert(output.actions.length === 3, `verwacht 3 acties, kreeg ${output.actions.length}`);
  assert(output.scenarios.length === 3, `verwacht 3 scenario's, kreeg ${output.scenarios.length}`);
  assert(output.thesis.split(/\s+/).length <= 25, "kernstelling is langer dan 25 woorden");

  const forbidden = /\b(balance|complexiteit|dynamiek|uitdaging|situatie|ontwikkeling)\b/i;
  assert(!forbidden.test(output.thesis), "kernstelling bevat verboden generieke taal");

  const markdown = renderFixtureMarkdown(output);
  assert(markdown === expected, "jeugdzorg golden fixture wijkt af van verwachte board-output");

  console.log("jeugdzorg board fixture regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
