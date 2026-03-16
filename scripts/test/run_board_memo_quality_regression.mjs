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
  const { scoreBoardMemoQuality } = await bundleModule(
    repoRoot,
    "src/aurelius/core/BoardMemoQualityScorer.ts",
    "board-memo-quality-regression"
  );

  const strongMemo = [
    "Bestuurlijke hypothese",
    "De organisatie moet kiezen tussen kernstabiliteit en versnelling van verbreding.",
    "",
    "Feitenbasis",
    "Contractdruk en capaciteitsgrenzen begrenzen de uitvoerbaarheid.",
    "",
    "Besluitvoorstel",
    "Kies richting A met expliciete stopregel, eigenaar, deadline en KPI.",
  ].join("\n");
  const weakMemo = "OUTPUT 1\nKeuzedruk 1\nmogelijk is dit verstandig";
  const leakedMemo = [
    "Bestuurlijke hypothese",
    "De organisatie moet kiezen tussen brede positionering en contractdiscipline.",
    "",
    "Feitenbasis",
    "Samenvatting gesprekverslag Fireflies:",
    "• Focus op veerkracht ambulante dienstverlening [Bron: Gesprek, 12 03 2026]",
    "",
    "Besluitvoorstel",
    "Laat het bestuur besluiten hoe deze interventie bestuurlijk borgt.",
  ].join("\n");

  const strong = scoreBoardMemoQuality(strongMemo);
  const weak = scoreBoardMemoQuality(weakMemo);
  const leaked = scoreBoardMemoQuality(leakedMemo);
  assert(strong.score >= 80, `sterke memo scoort te laag: ${strong.score}`);
  assert(weak.score < 60, `zwakke memo scoort te hoog: ${weak.score}`);
  assert(leaked.score < 70, `gelekte memo scoort te hoog: ${leaked.score}`);
  assert(
    leaked.findings.some((finding) => /ruwe bronblokken/i.test(finding)),
    "gelekte memo mist finding voor ruwe bronblokken"
  );
  assert(
    leaked.findings.some((finding) => /placeholder-besluittaal/i.test(finding)),
    "gelekte memo mist finding voor placeholder-besluittaal"
  );
  console.log("board memo quality regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
