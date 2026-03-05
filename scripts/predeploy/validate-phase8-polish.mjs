#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();

const REQUIRED_FORBIDDEN_TOKENS = [
  "moet expliciet worden",
  "keuzeconflicten moeten",
  "nog niet voldoende",
  "zou kunnen",
  "lijkt erop dat",
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readUtf8(filePath) {
  return fs.readFile(path.join(ROOT, filePath), "utf8");
}

function safeExtractDirectives(text) {
  const match = text.match(
    /Opportunity Cost MOET drie concrete tijdshorizons bevatten[\s\S]*?verwachte escalaties\./
  );
  return match ? match[0] : "";
}

function extractAssumptionCorpus(guardSource) {
  const matches = Array.from(guardSource.matchAll(/:\s*"([^"]+)"/g));
  return matches.map((m) => m[1]).join(" ");
}

async function runPlaywrightStringCheck(content) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(
      `<main><article id="probe">${content.replace(/</g, "&lt;")}</article></main>`,
      { waitUntil: "domcontentloaded" }
    );

    const rendered = await page.textContent("#probe");
    return String(rendered || "");
  } finally {
    await browser.close();
  }
}

async function main() {
  const narrativeSource = await readUtf8("src/aurelius/narrative/generateBoardroomNarrative.ts");
  const synthesisSource = await readUtf8("src/aurelius/synthesis/synthesizeBoardroomBrief.ts");
  const guardSource = await readUtf8("src/aurelius/narrative/guards/enforceConcreteOutput.ts");
  const pdfSource = await readUtf8("src/aurelius/engine/utils/generateAureliusPDF.ts");

  const directives = [
    safeExtractDirectives(narrativeSource),
    safeExtractDirectives(synthesisSource),
  ]
    .filter(Boolean)
    .join("\n");

  const assumptions = extractAssumptionCorpus(guardSource);
  const renderedDirectiveText = await runPlaywrightStringCheck(directives);

  const forbiddenPatterns = REQUIRED_FORBIDDEN_TOKENS.filter((token) =>
    new RegExp(escapeRegExp(token), "i").test(assumptions)
  );

  const opportunityCostHas3Horizons =
    /30\s*dagen/i.test(renderedDirectiveText) &&
    /90\s*dagen/i.test(renderedDirectiveText) &&
    /365\s*dagen/i.test(renderedDirectiveText);

  const governanceHasTegenkracht =
    /(tegenkracht|escalaties|informele)/i.test(renderedDirectiveText);

  const pdfHasDecisionLayer =
    /DECISION_CONTRACT_BG/.test(pdfSource) &&
    /DECISION_CONTRACT_BORDER/.test(pdfSource) &&
    /DECISION_CONTRACT_BORDER_WIDTH_MM/.test(pdfSource) &&
    /if\s*\(decisionSection\)\s*\{\s*newPage\(\)/s.test(pdfSource);

  const pdfHasRedLoss =
    /LOSS_TEXT_RED:\s*RGB\s*=\s*\[255,\s*77,\s*77\]/.test(pdfSource) &&
    /hasExplicitLossLanguage/.test(pdfSource);

  const pdfHasDecisionKader = pdfHasDecisionLayer && pdfHasRedLoss;

  // Required phase output contract.
  console.log(`forbidden patterns = ${JSON.stringify(forbiddenPatterns)}`);
  console.log(`opportunity_cost_has_3_horizons = ${opportunityCostHas3Horizons}`);
  console.log(`governance_has_tegenkracht = ${governanceHasTegenkracht}`);
  console.log(`pdf_has_decision_kader = ${pdfHasDecisionKader}`);

  if (
    forbiddenPatterns.length > 0 ||
    !opportunityCostHas3Horizons ||
    !governanceHasTegenkracht ||
    !pdfHasDecisionKader
  ) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
