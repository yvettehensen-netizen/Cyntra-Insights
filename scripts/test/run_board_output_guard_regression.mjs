#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

async function loadRuntimeModule(entryPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);

  await build({
    entryPoints: [entryPath],
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

function expectThrows(fn, expectedMessage) {
  let thrown = "";
  try {
    fn();
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(thrown === expectedMessage, `Expected "${expectedMessage}", got "${thrown || "no throw"}"`);
}

async function main() {
  const repoRoot = process.cwd();
  const guardPath = path.join(repoRoot, "src/aurelius/synthesis/boardOutputGuard.ts");
  const integrityPath = path.join(repoRoot, "src/aurelius/synthesis/outputIntegrity.ts");
  const concretePath = path.join(
    repoRoot,
    "src/aurelius/narrative/guards/enforceConcreteOutput.ts"
  );
  const pdfPath = path.join(repoRoot, "src/aurelius/engine/utils/generateAureliusPDF.ts");
  const downloadPath = path.join(repoRoot, "src/aurelius/pdf/downloadCyntraReport.tsx");
  const ggzDuplicateFixturePath = path.join(
    repoRoot,
    "scripts/test/fixtures/ggz_duplicate_sections_input.md"
  );

  const guardSource = read(guardPath);
  const integritySource = read(integrityPath);
  const pdfSource = read(pdfPath);
  const downloadSource = read(downloadPath);
  const ggzDuplicateFixture = read(ggzDuplicateFixturePath);

  // Static contract checks (v1.3)
  assert(/Board-output v1\.3: dubbele volledige sectie gedetecteerd\./.test(guardSource), "Missing v1.3 duplicate section error");
  assert(/Board-output v1\.3: semantische sectieherhaling gedetecteerd\./.test(guardSource), "Missing v1.3 semantic duplicate-section error");
  assert(/Board-output v1\.3: identieke kernzin binnen sectie\./.test(guardSource), "Missing v1.3 duplicate kernzin error");
  assert(/Board-output v1\.3: afgeknotte zin gedetecteerd\./.test(guardSource), "Missing v1.3 truncated sentence error");
  assert(!/hasSplitEuroNumber/.test(guardSource), "Legacy split-euro hard check should be removed");
  assert(!/Board-output voldoet niet aan interventiestandaard v2\.0/.test(guardSource), "Legacy v2.0 hard-fail message should be removed");

  assert(/assertBoardOutputStandard\(fullExportText,\s*\{[\s\S]*documentType:[\s\S]*sourceText/m.test(pdfSource), "PDF export must pass documentType/sourceText");
  assert(/assertBoardOutputStandard\(fullExportText,\s*\{[\s\S]*documentType:[\s\S]*sourceText/m.test(downloadSource), "Download export must pass documentType/sourceText");
  assert(/Board-output v1\.3:/.test(pdfSource), "PDF export must preserve v1.3 hard-fail errors");
  assert(/Board-output v1\.3:/.test(downloadSource), "Download export must preserve v1.3 hard-fail errors");
  assert(/Board-output v1\.3: dubbele volledige sectie gedetecteerd\./.test(integritySource), "Output integrity duplicate-section error missing");

  const guardRuntime = await loadRuntimeModule(guardPath, "board-guard");
  const integrityRuntime = await loadRuntimeModule(integrityPath, "output-integrity");
  const concreteRuntime = await loadRuntimeModule(concretePath, "enforce-concrete-output");

  const { assertBoardOutputStandard, validateBoardOutputStandard } = guardRuntime;
  const { assertOutputIntegrity } = integrityRuntime;
  const { enforceConcreteOutputMap } = concreteRuntime;

  const validDocument = [
    "### 1. Dominante These",
    "",
    "Kernzin: We kiezen één strategische lijn met aantoonbare kostenreductie binnen 90 dagen.",
    "",
    "### 2. Structurele Kernspanning",
    "",
    "Kernzin: Parallelle prioriteiten zonder mandaat veroorzaken structurele besluitvertraging.",
    "",
    "### 3. Keerzijde van de keuze",
    "",
    "Kernzin: We stoppen twee neveninitiatieven om kerncapaciteit vrij te maken.",
    "",
    "### 4. De Prijs van Uitstel",
    "",
    "Kernzin: Uitstel vergroot het verlies met circa €16.833 per maand.",
  ].join("\n");

  assert(assertBoardOutputStandard(validDocument) === true, "Valid document should pass board output standard");
  assertOutputIntegrity(validDocument);
  const validCheck = validateBoardOutputStandard(validDocument);
  assert(validCheck.ok === true, "Valid document should be ok");

  const duplicateSectionDoc = [
    "### 1. Dominante These",
    "",
    "Kernzin: Alpha veroorzaakt verlies.",
    "",
    "### 1. Dominante These",
    "",
    "Kernzin: Alpha veroorzaakt verlies.",
  ].join("\n");
  expectThrows(
    () => assertBoardOutputStandard(duplicateSectionDoc),
    "Board-output v1.3: dubbele volledige sectie gedetecteerd."
  );
  expectThrows(
    () => assertOutputIntegrity(duplicateSectionDoc),
    "Board-output v1.3: dubbele volledige sectie gedetecteerd."
  );

  const duplicateKernzinDoc = [
    "### 1. Dominante These",
    "",
    "Kernzin: Dezelfde zin blijft staan.",
    "Kernzin: Dezelfde zin blijft staan.",
  ].join("\n");
  expectThrows(
    () => assertBoardOutputStandard(duplicateKernzinDoc),
    "Board-output v1.3: identieke kernzin binnen sectie."
  );
  expectThrows(
    () => assertOutputIntegrity(duplicateKernzinDoc),
    "Board-output v1.3: identieke kernzin binnen sectie."
  );

  const semanticDuplicateSectionDoc = [
    "### 1. Dominante These",
    "",
    "Kernzin: Structurele druk ondermijnt capaciteit binnen 12 maanden.",
    "",
    "Deze keuze vraagt harde prioritering op kernzorg en het pauzeren van niet-kerninitiatieven.",
    "",
    "Kernzin: Structurele druk ondermijnt capaciteit binnen 12 maanden.",
    "",
    "Deze keuze vraagt harde prioritering op kernzorg en het pauzeren van niet-kerninitiatieven.",
  ].join("\n");
  let thrown = "";
  try {
    assertBoardOutputStandard(semanticDuplicateSectionDoc);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown === "Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section)." ||
      thrown === "Board-output v1.3: semantische sectieherhaling gedetecteerd.",
    `Expected semantic duplication hard fail, got "${thrown || "no throw"}"`
  );

  expectThrows(
    () =>
      assertBoardOutputStandard(validDocument, {
        documentType: "analysis",
        sourceText: "test",
      }),
    "Documentstructuur onvolledig of niet vergrendeld (Slot-Lock v4)."
  );

  thrown = "";
  try {
    assertBoardOutputStandard(ggzDuplicateFixture);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown === "Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section)." ||
      thrown === "Board-output v1.3: semantische sectieherhaling gedetecteerd.",
    `Expected fixture duplication hard fail, got "${thrown || "no throw"}"`
  );

  thrown = "";
  try {
    assertOutputIntegrity(ggzDuplicateFixture);
  } catch (error) {
    thrown = String(error?.message ?? error);
  }
  assert(
    thrown === "Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section)." ||
      thrown === "Board-output v1.3: identieke kernzin binnen sectie.",
    `Expected fixture integrity hard fail, got "${thrown || "no throw"}"`
  );

  const truncatedDoc = [
    "### 1. Dominante These",
    "",
    "Kernzin: We stoppen vandaag met parallelle prioriteiten en",
  ].join("\n");
  expectThrows(
    () => assertBoardOutputStandard(truncatedDoc),
    "Board-output v1.3: afgeknotte zin gedetecteerd."
  );
  expectThrows(
    () => assertOutputIntegrity(truncatedDoc),
    "Board-output v1.3: afgeknotte zin gedetecteerd."
  );

  const dominantInput = [
    "Structurele druk van €202.000 per jaar veroorzaakt verlies van 1,3 FTE binnen 12 maanden.",
    "Expliciet verlies: pauze op minimaal één niet-kerninitiatief.",
    "GGZ-kern met plafonds rond €160.000 en oplopende loonkosten.",
  ].join(" ");
  const dominantOutput = guardRuntime.runBoardOutputGuard(dominantInput, {
    fullDocument: false,
    sectionTitle: "Dominante These",
  });
  assert(
    /behandelcontinu[iï]teit verliezen|wachtlijst/i.test(dominantOutput),
    "Dominante these must include zorg-impact op behandelcontinuiteit/wachtlijst"
  );
  assert(
    /rekenkundig onmogelijk zonder margeherstel/i.test(dominantOutput),
    "Dominante these must include inevitability sentence"
  );

  const governanceInput =
    "Zonder contractvloer verschuift escalatie van systeemdruk naar bestuurlijke nalatigheid.";
  const governanceOutput = guardRuntime.runBoardOutputGuard(governanceInput, {
    fullDocument: false,
    sectionTitle: "Mandaat & Besluitrecht",
  });
  assert(
    /geen marktrisico meer,\s*maar een bestuurlijke keuze/i.test(governanceOutput),
    "Governance section must include bestuurlijke-keuzezin"
  );

  const decisionInput =
    "Dag 90 zonder volledige margekaart blokkeert verbreding in de GGZ-kern.";
  const decisionOutput = guardRuntime.runBoardOutputGuard(decisionInput, {
    fullDocument: false,
    sectionTitle: "Besluitkader",
  });
  assert(
    /vervalt het mandaat om nieuwe initiatieven te starten automatisch/i.test(decisionOutput),
    "Besluitkader must include onomkeerbare mandaattrigger"
  );

  const repeatedFallback =
    "Als het bestuur in GGZ/Jeugdzorg niet eerst de kern consolideert met expliciete prioritering, stoplijst en eigenaarschap, dan blijven consolidatie en verbreding parallel lopen, waardoor aanhoudende margedruk door >5% loonkostenstijging, tariefverlaging in 2026 en contractplafonds structureel oploopt. Dat betekent dat de verantwoordelijke bestuurder feitelijk kiest voor uitstel boven kernstabilisatie; expliciet verlies: tijdelijk pauzeren van minimaal één niet-kerninitiatief totdat de GGZ-kern financieel stabiel draait.";
  const deduped = enforceConcreteOutputMap(
    {
      dominantThesis: `Kernzin. ${repeatedFallback}`,
      coreConflict: `Conflict. ${repeatedFallback}`,
      tradeoffs: `Tradeoff. ${repeatedFallback}`,
      decisionContract: `Contract. ${repeatedFallback}`,
    },
    { contextHint: "GGZ context" }
  );
  assert(
    !/Als het bestuur in GGZ\/Jeugdzorg/i.test(deduped.coreConflict),
    "Core conflict must strip shared consolidation fallback boilerplate"
  );
  assert(
    !/Als het bestuur in GGZ\/Jeugdzorg/i.test(deduped.tradeoffs),
    "Tradeoffs must strip shared consolidation fallback boilerplate"
  );

  console.log("board output guard regression tests passed (v1.3)");
}

main();
