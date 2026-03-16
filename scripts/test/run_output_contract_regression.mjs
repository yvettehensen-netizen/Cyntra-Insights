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

async function main() {
  const repoRoot = process.cwd();
  const { runAureliusEngine } = await bundleModule(
    repoRoot,
    "src/aurelius/engine/runAurelius.ts",
    "output-contract-regression"
  );

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        analysis: {
          id: "analysis-contract-test",
          result_payload: {
            narrative: {
              executive_summary:
                "Molendrift moet impact vergroten zonder het eigenaarschapsmechanisme te breken.",
              board_memo:
                "Bestuurlijke hypothese\nSchaal alleen via replicatie.\n\nKernconflict (A/B keuze)\nGroei vs cultuurbehoud.\n\nBesluitvoorstel\nAanbevolen optie: C",
            },
            decision: {
              recommended_option: "C",
            },
            intervention_actions: [
              "Sluit drie implementatieallianties",
              "Schaal kort-traject triage regionaal op",
            ],
            strategic_levers: [
              {
                lever: "netwerk",
                mechanism: "partners vermenigvuldigen impact zonder extra FTE",
                risk: "kwaliteitsverlies bij zwakke governance",
                boardImplication: "borg partnerkwaliteit contractueel",
              },
            ],
            strategy_dna: {
              pattern: "professional_partnership",
            },
            scenario_simulation: {
              preferred: "C",
            },
            benchmark: {
              sector: "Zorg/GGZ",
            },
            decision_memory: {
              last_choice: "C",
            },
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  const output = await runAureliusEngine({
    analysis_type: "Strategische analyse",
    company_context: "Molendrift broncontext",
  });

  assert(output.success, "analyse uitvoeren faalt");
  assert(output.result.executive_summary, "output contract mist executive_summary");
  assert(output.result.board_memo, "output contract mist board_memo");
  assert(Array.isArray(output.result.interventions), "output contract mist interventions");
  assert(output.result.strategic_conflict, "output contract mist strategic_conflict");
  assert(output.result.recommended_option, "output contract mist recommended_option");

  console.log("output contract regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
