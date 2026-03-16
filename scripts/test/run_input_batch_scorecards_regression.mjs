#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const repoRoot = process.cwd();
  const outputDir = path.join(repoRoot, "reports/test-suite/input-batch-scorecards-regression");
  fs.mkdirSync(outputDir, { recursive: true });

  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, "scripts/test/run_input_batch_scorecards.mjs"),
      "--manifest",
      "scripts/test/fixtures/input_batch_cases.json",
      "--output-dir",
      outputDir,
    ],
    { stdio: "inherit" }
  );

  const summary = JSON.parse(fs.readFileSync(path.join(outputDir, "summary.json"), "utf8"));
  assert(summary.aggregate.caseCount >= 4, "batch scorecard draait te weinig cases");
  assert(summary.aggregate.averageMemoScore >= 80, `gemiddelde memoscore te laag (${summary.aggregate.averageMemoScore})`);
  assert(summary.aggregate.averageOverallScore >= 45, `gemiddelde batchscore te laag (${summary.aggregate.averageOverallScore})`);
  assert(summary.results.every((item) => item.memoArtifactPass), "batch scorecard bevat memo-artefacten");
  console.log("input batch scorecards regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
