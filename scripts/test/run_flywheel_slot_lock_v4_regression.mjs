#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundleModule(entryPath, outName) {
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

function sampleInput() {
  return {
    board_report: [
      "### 1. Dominante These",
      "Kernzin: Zonder harde volgorde tussen consolideren en verbreden ontstaat binnen 12-18 maanden verhoogd liquiditeitsrisico.",
      "",
      "### 2. Structurele Kernspanning",
      "Kernzin: Parallelle prioriteiten zonder contractdiscipline versnellen margeslijtage.",
      "",
      "### 8. 90-Dagen Interventieontwerp",
      "Actie: Stop nieuwe initiatieven zonder margevalidatie.",
      "Eigenaar: MT",
      "Deadline: binnen 30 dagen",
      "KPI: 100% gevalideerde initiatieven",
      "Escalatiepad: >48 uur blokkade -> RvT",
      "Casus-anker: contractplafond",
    ].join("\n"),
    decision_output: {
      dominant_problem: "Parallelle verbreding zonder contractzekerheid veroorzaakt structurele margeslijtage.",
      dominant_thesis:
        "Zonder harde volgorde tussen consolideren en verbreden ontstaat binnen 12-18 maanden verhoogd liquiditeitsrisico.",
      strategic_options: [
        { code: "A", description: "Consolideren van de GGZ-kern met margeherstel." },
        { code: "B", description: "Versneld verbreden via HR-loket en nieuwe pijlers." },
        { code: "C", description: "Gefaseerde strategie met harde stopregels." },
      ],
      recommended_option: "C",
      interventieplan:
        "Consolideren eerst. Contractdiscipline afdwingen. Geen verbreding zonder positieve margevalidatie en capaciteitsimpact.",
    },
    mechanisms: [
      { mechanism: "Tariefdruk en contractplafonds limiteren omzetgroei." },
      { mechanism: "Productiviteitsnorm zonder volledige cijferopenheid creëert gedragsfrictie." },
    ],
    insights: [{ insight: "Volgordefout vergroot liquiditeitsstress." }],
    metadata: {
      organisatie_type: "GGZ-praktijk",
      sector: "Zorg/GGZ",
      organisatie_grootte: "25 medewerkers",
      verdienmodel: "Declaratiegedreven met verzekeraarsafhankelijkheid",
      analyse_datum: "2026-03-05",
    },
    intervention_outcomes: [],
  };
}

function splitSections(text) {
  return [...String(text ?? "").matchAll(/^([1-9])\.\s+[^\n]+$/gm)];
}

async function main() {
  const repoRoot = process.cwd();

  const flywheelEntry = path.join(repoRoot, "scripts/ts/runFlywheelCycle.entry.ts");
  const guardEntry = path.join(repoRoot, "src/aurelius/synthesis/boardOutputGuard.ts");

  const flywheelRuntime = await bundleModule(flywheelEntry, "flywheel-slotlock-runtime");
  const guardRuntime = await bundleModule(guardEntry, "flywheel-slotlock-guard");

  const output = await flywheelRuntime.runFlywheelCycle(sampleInput());
  const report = String(output?.enriched_board_report ?? "").trim();

  assert(report.length > 0, "Flywheel output bevat geen enriched_board_report.");

  const sections = splitSections(report);
  assert(sections.length === 9, `Expected 9 secties, got ${sections.length}.`);
  const numbers = sections.map((item) => Number(item[1])).sort((a, b) => a - b);
  for (let i = 1; i <= 9; i += 1) {
    assert(numbers[i - 1] === i, `Sectienummer ${i} ontbreekt in enriched board report.`);
  }

  const validated = guardRuntime.validateBoardOutputStandard(report, {
    documentType: "analysis",
    sourceText: report,
  });
  assert(validated.ok === true, `Slot-Lock v4 validatie faalt: ${validated.reasons.join(" | ")}`);

  guardRuntime.assertBoardOutputStandard(report, {
    documentType: "analysis",
    sourceText: report,
  });

  console.log("flywheel slot-lock v4 regression tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

