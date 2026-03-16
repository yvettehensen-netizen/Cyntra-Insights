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
  const { validateBoardReport } = await bundleModule(
    repoRoot,
    "src/aurelius/engine/validators/BoardReportValidator.ts",
    "multi-sector-board-validator"
  );

  const fixtureNames = [
    "jeugdzorg_zijn_boardroom_golden.md",
    "ggz_contractdruk_boardroom_golden.md",
    "b2b_dienstverlening_boardroom_golden.md",
    "saas_scaleup_boardroom_golden.md",
  ];

  for (const fixtureName of fixtureNames) {
    const text = fs.readFileSync(path.join(repoRoot, "scripts/test/fixtures", fixtureName), "utf8");
    const result = validateBoardReport(text);
    assert(result.issues.length === 0, `${fixtureName} faalt board validator: ${result.issues.map((i) => i.message).join(", ")}`);
    assert(!/Keuzedruk|HARD -|bron:|Kopieer richting/i.test(text), `${fixtureName} bevat prompt leakage`);
    assert(/KERNPROBLEEM/.test(text) && /KERNSTELLING/.test(text) && /AANBEVOLEN KEUZE/.test(text), `${fixtureName} mist kernsecties`);
    assert(/STOPREGEL:\s*.+(?:>|<|\d+\s*(?:weken|dagen|maanden|%|kwartaal))/i.test(text), `${fixtureName} mist meetbare stopregel`);
  }

  console.log("multi-sector golden regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
