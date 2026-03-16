#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadRuntime(repoRoot) {
  const entry = path.join(repoRoot, "src/aurelius/synthesis/outputIntegrity.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "output-integrity-"));
  const outFile = path.join(outDir, "outputIntegrity.mjs");

  await build({
    entryPoints: [entry],
    outfile: outFile,
    format: "esm",
    platform: "node",
    target: ["node18"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });

  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const runtime = await loadRuntime(repoRoot);
  const { assertOutputIntegrity, getOutputIntegrityMetrics } = runtime;
  const ggzDuplicateFixturePath = path.join(
    repoRoot,
    "scripts/test/fixtures/ggz_duplicate_sections_input.md"
  );
  const ggzDuplicateFixture = fs.readFileSync(ggzDuplicateFixturePath, "utf8");

  const cleanDoc = [
    "1. Dominante These",
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk per maand.",
    "",
    "2. Structurele Kernspanning",
    "Kernzin: Parallel sturen vergroot risico.",
    "",
    "3. Keerzijde van de keuze",
    "Kernzin: Keuze vraagt expliciet verlies.",
    "",
    "4. De Prijs van Uitstel",
    "Kernzin: Uitstel vergroot liquiditeitsrisico.",
    "Status: OK.",
    "",
    "5. Mandaat & Besluitrecht",
    "Kernzin: Mandaat wordt centraal belegd.",
    "",
    "6. Onderstroom & Informele Macht",
    "Kernzin: Onderstroom vertaalt zich in vermijding.",
    "",
    "7. Faalmechanisme",
    "Kernzin: Zonder ritme stapelt uitstel.",
    "",
    "8. 90-Dagen Interventieontwerp",
    "Kernzin: Acties zijn eigenaar- en KPI-gebonden.",
    "",
    "9. Besluitkader",
    "Kernzin: Geen initiatief zonder margevalidatie.",
  ].join("\n");

  const metrics = getOutputIntegrityMetrics(cleanDoc);
  console.log("metrics", metrics);
  assert(metrics.headingMatches === 9, "headingMatches moet 9 zijn");
  assert(metrics.duplicateSections === 0, "duplicateSections moet 0 zijn");
  assert(metrics.duplicateParagraphBlocks === 0, "duplicateParagraphBlocks moet 0 zijn");
  assert(metrics.duplicateKernzin === 0, "duplicateKernzin moet 0 zijn");
  assert(metrics.splitEuro === false, "splitEuro moet false zijn");
  assert(metrics.sentenceIntegrity === true, "sentenceIntegrity moet true zijn");
  assert(metrics.statusLineDuplicates === 0, "statusLineDuplicates moet 0 zijn");
  assertOutputIntegrity(cleanDoc);

  // 1) duplicate section content (exact)
  const duplicateSectionDoc = [
    "1. Dominante These",
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk per maand.",
    "",
    "1. Dominante These",
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk per maand.",
  ].join("\n");
  let thrown = "";
  try {
    assertOutputIntegrity(duplicateSectionDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output v1.3: dubbele volledige sectie gedetecteerd."),
    "duplicate section content moet hard failen"
  );

  // 1b) duplicate paragraph block binnen sectie
  const duplicateParagraphBlockDoc = [
    "1. Dominante These",
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk per maand.",
    "",
    "Deze keuze vraagt focus op de GGZ-kern en pauze op niet-kerninitiatieven.",
    "",
    "Deze keuze vraagt focus op de GGZ-kern en pauze op niet-kerninitiatieven.",
    "",
    "2. Structurele Kernspanning",
    "Kernzin: Parallel sturen vergroot risico.",
    "",
    "3. Keerzijde van de keuze",
    "Kernzin: Keuze vraagt expliciet verlies.",
    "",
    "4. De Prijs van Uitstel",
    "Kernzin: Uitstel vergroot liquiditeitsrisico.",
    "",
    "5. Mandaat & Besluitrecht",
    "Kernzin: Mandaat wordt centraal belegd.",
    "",
    "6. Onderstroom & Informele Macht",
    "Kernzin: Onderstroom vertaalt zich in vermijding.",
    "",
    "7. Faalmechanisme",
    "Kernzin: Zonder ritme stapelt uitstel.",
    "",
    "8. 90-Dagen Interventieontwerp",
    "Kernzin: Acties zijn eigenaar- en KPI-gebonden.",
    "",
    "9. Besluitkader",
    "Kernzin: Geen initiatief zonder margevalidatie.",
  ].join("\n");
  thrown = "";
  try {
    assertOutputIntegrity(duplicateParagraphBlockDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section)."),
    "duplicate paragraph block moet hard failen"
  );

  // 2) identieke kernzin binnen 1 sectie
  const duplicateParagraphDoc = cleanDoc.replace(
    "Kernzin: Keuze vraagt expliciet verlies.",
    "Kernzin: Keuze vraagt expliciet verlies.\nKernzin: Keuze vraagt expliciet verlies."
  );
  thrown = "";
  try {
    assertOutputIntegrity(duplicateParagraphDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output v1.3: identieke kernzin binnen sectie."),
    "duplicate kernzin in sectie moet hard failen"
  );

  // 3) afgeknotte zin
  const truncatedDrukDoc = cleanDoc.replace(
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk per maand.",
    "Kernzin: Structurele druk veroorzaakt circa €16.833 druk en"
  );
  thrown = "";
  try {
    assertOutputIntegrity(truncatedDrukDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output v1.3: afgeknotte zin gedetecteerd."),
    "afgeknotte druk-zin moet failen"
  );

  // 3b) dubbele statusregel in een sectie
  const duplicateStatusDoc = cleanDoc.replace(
    "Status: OK.",
    "Status: OK.\nStatus: OK."
  );
  thrown = "";
  try {
    assertOutputIntegrity(duplicateStatusDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output v1.3: dubbele statusregel binnen sectie."),
    "dubbele statusregel moet hard failen"
  );

  // 4) GGZ fixture met dubbel geplakte sectie-inhoud
  thrown = "";
  try {
    assertOutputIntegrity(ggzDuplicateFixture);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown.includes("Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section).") ||
      thrown.includes("Board-output v1.3: identieke kernzin binnen sectie."),
    "GGZ fixture met dubbele sectie-inhoud moet hard failen"
  );

  console.log("output integrity regression tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
