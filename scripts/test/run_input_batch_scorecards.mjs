#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function parseArgs(argv) {
  const args = {
    manifest: "scripts/test/fixtures/input_batch_cases.json",
    outputDir: "reports/test-suite/input-batch-scorecards",
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--manifest") args.manifest = argv[index + 1];
    if (token === "--output-dir") args.outputDir = argv[index + 1];
    if (token === "--strict") args.strict = true;
  }

  return args;
}

function installMemoryStorage() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage };
}

async function bundleModule(repoRoot, entryFile, outName, platform = "node") {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
  await build({
    entryPoints: [path.join(repoRoot, entryFile)],
    outfile: outFile,
    format: "esm",
    platform,
    target: platform === "browser" ? ["es2020"] : ["node20"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function resolveRecommendedOption(rawValue, expectedOptions = []) {
  const value = normalize(rawValue);
  if (!/^[ABC]$/i.test(value)) return value;
  const index = value.toUpperCase().charCodeAt(0) - 65;
  return normalize(expectedOptions[index] || value);
}

function countKeywordHits(text, keywords = []) {
  const source = String(text ?? "").toLowerCase();
  return keywords.filter((keyword) => source.includes(String(keyword).toLowerCase())).length;
}

function computeOverallScore(params) {
  const {
    memoScore,
    boardIssueCodes,
    consistencyFindings,
    scenarioIssues,
    keywordCoverage,
    keywordTarget,
    memoArtifactPass,
    rawReportArtifactPass,
  } = params;
  let score = memoScore;
  score -= boardIssueCodes * 5;
  score -= consistencyFindings * 6;
  score -= scenarioIssues * 3;
  if (keywordTarget > 0) {
    score += Math.round((keywordCoverage / keywordTarget) * 10);
  }
  if (!memoArtifactPass) score -= 25;
  if (!rawReportArtifactPass) score -= 5;
  return Math.max(0, Math.min(100, score));
}

function markdownSummary(results, aggregate) {
  const lines = [
    "# Input Batch Scorecards",
    "",
    `Cases: ${aggregate.caseCount}`,
    `Average overall score: ${aggregate.averageOverallScore}`,
    `Average memo score: ${aggregate.averageMemoScore}`,
    `Failures: ${aggregate.failures}`,
    "",
    "| Case | Sector | Overall | Memo | Keywords | Issues | Consistency | Scenario | Status |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ];

  results.forEach((result) => {
    lines.push(
      `| ${result.id} | ${result.sector} | ${result.overallScore} | ${result.memoScore} | ${result.keywordHits}/${result.keywordTarget} | ${result.boardIssueCodes.length} | ${result.consistencyFindings.length} | ${result.scenarioIssues.length} | ${result.pass ? "pass" : "fail"} |`
    );
  });

  lines.push("", "## Findings", "");
  results.forEach((result) => {
    lines.push(`### ${result.id}`);
    lines.push(`- Recommended option: ${result.recommendedOption || "n.v.t."}`);
    lines.push(`- Historical outcome: ${result.historicalOutcome || "n.v.t."}`);
    lines.push(`- Memo artifacts: ${result.memoArtifactPass ? "geen" : "gedetecteerd"}`);
    lines.push(`- Raw report artifacts: ${result.rawReportArtifactPass ? "geen" : "gedetecteerd"}`);
    lines.push(`- Board issues: ${result.boardIssues.length ? result.boardIssues.join(" | ") : "geen"}`);
    lines.push(`- Consistency findings: ${result.consistencyFindings.length ? result.consistencyFindings.join(" | ") : "geen"}`);
    lines.push(`- Scenario issues: ${result.scenarioIssues.length ? result.scenarioIssues.join(" | ") : "geen"}`);
    lines.push("");
  });

  return lines.join("\n");
}

async function main() {
  const repoRoot = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, args.manifest), "utf8"));
  const outputDir = path.isAbsolute(args.outputDir) ? args.outputDir : path.join(repoRoot, args.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  installMemoryStorage();
  const bridgeModule = await bundleModule(repoRoot, "src/pages/portal/saas/usePlatformApiBridge.ts", "input-batch-bridge", "browser");
  const scorerModule = await bundleModule(repoRoot, "src/aurelius/core/BoardMemoQualityScorer.ts", "input-batch-memo-scorer");
  const reportValidatorModule = await bundleModule(repoRoot, "src/aurelius/engine/validators/BoardReportValidator.ts", "input-batch-report-validator");
  const consistencyModule = await bundleModule(repoRoot, "src/aurelius/engine/validators/StrategicConsistencyGuard.ts", "input-batch-consistency");
  const mapBuilderModule = await bundleModule(repoRoot, "src/aurelius/analysis/buildStrategicAnalysisMap.ts", "input-batch-map-builder");
  const scenarioModule = await bundleModule(repoRoot, "src/aurelius/validators/scenario_distinctness_check.ts", "input-batch-scenario");
  const renderMapModule = await bundleModule(repoRoot, "src/aurelius/analysis/renderStrategicAnalysisMapReport.ts", "input-batch-map-render");

  const { platformApiBridge } = bridgeModule;
  const { scoreBoardMemoQuality } = scorerModule;
  const { validateBoardReport } = reportValidatorModule;
  const { validateStrategicConsistency } = consistencyModule;
  const { buildStrategicAnalysisMap } = mapBuilderModule;
  const { scenarioDistinctnessCheck } = scenarioModule;
  const { renderStrategicAnalysisMapReport } = renderMapModule;

  const results = [];

  for (const item of manifest) {
    const inputText = fs.readFileSync(path.join(repoRoot, item.sourcePath), "utf8");
    const analysis = await platformApiBridge.runAnalysis({
      organization_id: `org-${String(item.id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      organization_name: item.organization_name,
      sector: item.sector,
      organisatie_grootte: item.organisatie_grootte || "Middelgroot",
      abonnementstype: "Professional",
      analysis_type: "Strategische analyse",
      input_data: inputText,
    });

    const result = analysis?.result || {};
    const session = analysis?.session || {};
    const boardMemo = String(result.board_memo || session.board_memo || "");
    const boardReport = String(analysis?.report?.report_body || session.board_report || "");
    const recommendedOption = resolveRecommendedOption(
      result.recommended_option || session?.strategic_metadata?.gekozen_strategie || "",
      item.expectedOptions || []
    );
    const analysisMap = buildStrategicAnalysisMap({
      organisation: item.organization_name,
      sector: item.sector,
      dominantRisk: normalize(result.strategic_conflict || result.executive_summary || boardMemo),
      strategicOptions: Array.isArray(item.expectedOptions) ? item.expectedOptions : [],
      recommendedOption,
      scenarioSimulationOutput: boardReport,
      interventionOutput: boardMemo,
      memoryProblemText: inputText,
    });
    const structuredReport = renderStrategicAnalysisMapReport(analysisMap);

    const memoQuality = scoreBoardMemoQuality(boardMemo);
    const boardValidation = validateBoardReport(boardReport, analysisMap);
    const structuredConsistency = validateStrategicConsistency({
      reportText: structuredReport,
      sourceText: inputText,
      analysisMap,
    });
    const rawConsistency = validateStrategicConsistency({
      reportText: boardReport,
      sourceText: inputText,
      analysisMap,
    });
    const scenarioCheck = scenarioDistinctnessCheck(analysisMap);
    const keywordHits = countKeywordHits(`${boardReport}\n${boardMemo}`, item.expectedKeywords || []);
    const keywordTarget = Array.isArray(item.expectedKeywords) ? item.expectedKeywords.length : 0;
    const memoArtifactPass = !/Keuzedruk|HARD -|bron:|Kopieer richting|OUTPUT 1|CONTEXT LAYER/i.test(boardMemo);
    const rawReportArtifactPass = !/Keuzedruk|HARD -|bron:|Kopieer richting|OUTPUT 1|CONTEXT LAYER/i.test(boardReport);
    const boardIssueCodes = Array.from(new Set(boardValidation.issues.map((issue) => issue.code)));
    const overallScore = computeOverallScore({
      memoScore: memoQuality.score,
      boardIssueCodes: boardIssueCodes.length,
      consistencyFindings: structuredConsistency.findings.length,
      scenarioIssues: scenarioCheck.issues.length,
      keywordCoverage: keywordHits,
      keywordTarget,
      memoArtifactPass,
      rawReportArtifactPass,
    });
    const pass = memoArtifactPass && memoQuality.score >= 70 && overallScore >= 45;

    const scorecard = {
      id: item.id,
      organizationName: item.organization_name,
      sector: item.sector,
      overallScore,
      memoScore: memoQuality.score,
      keywordHits,
      keywordTarget,
      memoArtifactPass,
      rawReportArtifactPass,
      pass,
      recommendedOption,
      historicalOutcome: analysisMap.memoryInsights?.historicalOutcome || "",
      boardIssueCodes,
      boardIssues: boardValidation.issues.map((issue) => issue.message),
      consistencyFindings: structuredConsistency.findings.map((finding) => finding.message),
      rawConsistencyFindings: rawConsistency.findings.map((finding) => finding.message),
      scenarioIssues: scenarioCheck.issues,
      boardMemoQualityFindings: memoQuality.findings,
    };
    results.push(scorecard);
    fs.writeFileSync(path.join(outputDir, `${item.id}.json`), JSON.stringify(scorecard, null, 2));
  }

  const aggregate = {
    caseCount: results.length,
    averageOverallScore: Math.round(results.reduce((sum, item) => sum + item.overallScore, 0) / Math.max(1, results.length)),
    averageMemoScore: Math.round(results.reduce((sum, item) => sum + item.memoScore, 0) / Math.max(1, results.length)),
    failures: results.filter((item) => !item.pass).length,
  };

  fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify({ aggregate, results }, null, 2));
  fs.writeFileSync(path.join(outputDir, "summary.md"), markdownSummary(results, aggregate));

  console.log(`input batch scorecards generated in ${outputDir}`);
  console.log(`average overall score: ${aggregate.averageOverallScore}`);
  console.log(`failures: ${aggregate.failures}`);

  if (args.strict && aggregate.failures > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
