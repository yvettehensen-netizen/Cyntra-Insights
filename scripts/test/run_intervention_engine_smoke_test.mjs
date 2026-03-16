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
  const { InterventionEngine } = await bundleModule(
    repoRoot,
    "src/aurelius/core/InterventionEngine.ts",
    "intervention-engine"
  );
  const engine = new InterventionEngine();
  const interventions = engine
    .generateInterventions(
      `
ACTIE: Standaardiseer triage
WAAROM DEZE INTERVENTIE: beschermt de kern
RISICO VAN NIET HANDELEN: wachtdruk blijft oplopen
STOPREGEL: wachttijd > 12 weken
Eigenaar: Bestuur
Deadline: 15 dagen
KPI: wachtdruk daalt
`.trim()
    )
    .map((item) => engine.generateKPIs(engine.generateStopRules(engine.assignOwner(item))));

  assert(interventions.length >= 10, "intervention engine genereert minder dan 10 interventies");
  const first = interventions[0];
  assert(first.action && first.reason && first.risk && first.stopRule, "interventie is incompleet");
  assert(first.owner && first.deadline && first.KPI, "interventie mist owner/deadline/KPI");
  console.log("intervention engine smoke test passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
