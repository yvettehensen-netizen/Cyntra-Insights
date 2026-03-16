#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function parseArgs(argv) {
  const args = {
    input: "",
    outputDir: "reports/flywheel/latest-cycle",
    sample: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === "--input") args.input = argv[i + 1] ?? "";
    if (current === "--output-dir") args.outputDir = argv[i + 1] ?? args.outputDir;
    if (current === "--sample") args.sample = true;
  }

  return args;
}

function sampleInput() {
  return {
    board_report: [
      "Dominante these",
      "Structurele margedruk door tariefdaling, loonkostenstijging en contractplafonds ondermijnt capaciteit.",
      "",
      "Besluit",
      "Kies consolideren, daarna stabiliseren, daarna gecontroleerde verbreding.",
      "",
      "90-dagen interventieprogramma",
      "1. Stop nieuwe initiatieven zonder margevalidatie.",
      "2. Bouw volledige margekaart per product/team/verzekeraar.",
      "3. Definieer contractvloer per verzekeraar.",
      "4. Veranker wekelijkse cash- en KPI-sturing.",
      "5. Borg capaciteitsneutraliteit voor HR-loket.",
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
    insights: [
      { insight: "Volgordefout vergroot liquiditeitsstress.", description: "Eerst kernstabilisatie vereist." },
    ],
    metadata: {
      organisatie_type: "GGZ-praktijk",
      sector: "Zorg/GGZ",
      organisatie_grootte: "25 medewerkers",
      verdienmodel: "Declaratiegedreven met verzekeraarsafhankelijkheid",
      analyse_datum: new Date().toISOString().slice(0, 10),
    },
    intervention_outcomes: [],
  };
}

async function loadInput(inputPath, forceSample) {
  if (forceSample || !normalize(inputPath)) return sampleInput();
  const abs = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw);
}

async function loadRunnerFunction() {
  const repoRoot = process.cwd();
  const entryPath = path.join(repoRoot, "scripts/ts/runFlywheelCycle.entry.ts");
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cyntra-flywheel-"));
  const outFile = path.join(tempDir, "runFlywheelCycle.bundle.mjs");

  await build({
    entryPoints: [entryPath],
    outfile: outFile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    sourcemap: false,
    tsconfig: path.join(repoRoot, "tsconfig.json"),
    logLevel: "silent",
  });

  const mod = await import(`${pathToFileURL(outFile).href}?v=${Date.now()}`);
  if (typeof mod.runFlywheelCycle !== "function") {
    throw new Error("Bundled flywheel runner export `runFlywheelCycle` ontbreekt.");
  }
  return mod.runFlywheelCycle;
}

function buildSummary(result) {
  return {
    timestamp: new Date().toISOString(),
    case_id: result.learning_cycle.strategic_case.case_id,
    sector: result.learning_cycle.strategic_case.sector,
    dominant_problem_category: result.learning_cycle.strategic_case.dominant_problem_category,
    dataset_update: result.learning_cycle.dataset_update,
    interventions_registered: result.learning_cycle.interventions.length,
    outcomes_evaluated: result.learning_cycle.outcomes.length,
    pattern_updates: result.learning_cycle.pattern_engine_update.intervention_success_patterns.length,
  };
}

async function writeOutputs(outputDir, input, result) {
  const absOutputDir = path.resolve(process.cwd(), outputDir);
  await fs.mkdir(absOutputDir, { recursive: true });

  const summary = buildSummary(result);
  const files = {
    "input.json": JSON.stringify(input, null, 2),
    "learning-cycle.json": JSON.stringify(result, null, 2),
    "summary.json": JSON.stringify(summary, null, 2),
    "enriched-board-report.md": result.enriched_board_report,
  };

  for (const [file, content] of Object.entries(files)) {
    await fs.writeFile(path.join(absOutputDir, file), content, "utf8");
  }

  return { absOutputDir, summary };
}

async function main() {
  const args = parseArgs(process.argv);
  const input = await loadInput(args.input, args.sample);
  const runFlywheelCycle = await loadRunnerFunction();
  const result = await runFlywheelCycle(input);
  const { absOutputDir, summary } = await writeOutputs(args.outputDir, input, result);

  console.log("Flywheel cycle completed.");
  console.log(`Output directory: ${absOutputDir}`);
  console.log(`Case: ${summary.case_id}`);
  console.log(
    `Dataset counts -> cases: ${summary.dataset_update.case_count}, interventions: ${summary.dataset_update.intervention_count}, outcomes: ${summary.dataset_update.outcome_count}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

