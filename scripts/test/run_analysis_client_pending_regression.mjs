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
    "analysis-client-pending-regression"
  );

  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, method: String(init.method || "GET").toUpperCase() });

    if (url === "/api/analyses" && String(init.method || "GET").toUpperCase() === "POST") {
      return new Response(
        JSON.stringify({
          analysis: {
            id: "analysis-pending-test",
            status: "pending",
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (url === "/api/analyses/analysis-pending-test") {
      return new Response(
        JSON.stringify({
          analysis: {
            id: "analysis-pending-test",
            status: "done",
            result_payload: {
              narrative: {
                executive_summary: "Pending analyse is correct opnieuw opgehaald.",
                board_memo:
                  "Bestuurlijke hypothese\nHerlaad detailrecord zodra create pending teruggeeft.\n\nKernconflict (A/B keuze)\nSnelheid vs contractstabiliteit.\n\nBesluitvoorstel\nAanbevolen optie: B",
              },
              decision: {
                recommended_option: "B",
              },
              intervention_actions: ["Herlaad analyse-details voor finale payload"],
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    throw new Error(`Onverwachte fetch: ${url}`);
  };

  const output = await runAureliusEngine({
    analysis_type: "Strategische analyse",
    company_context: "Pending broncontext",
  });

  assert(output.success, "analyse uitvoeren faalt bij pending status");
  assert(output.result.executive_summary, "executive_summary ontbreekt na pending detail-fetch");
  assert(
    calls.some((call) => call.url === "/api/analyses/analysis-pending-test" && call.method === "GET"),
    "pending analyse haalt detailrecord niet op"
  );

  console.log("analysis client pending regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
