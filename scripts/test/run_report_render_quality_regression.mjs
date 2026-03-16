#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const reportPagePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"
);
const boardroomViewPath = path.resolve(
  process.cwd(),
  "src/components/reports/BoardroomView.tsx"
);
const strategyViewPath = path.resolve(
  process.cwd(),
  "src/components/reports/StrategyReportView.tsx"
);

const reportPage = fs.readFileSync(reportPagePath, "utf8");
const strategyView = fs.readFileSync(strategyViewPath, "utf8");
const boardroomView = fs.readFileSync(boardroomViewPath, "utf8");

assert(
  !reportPage.includes('.replace(/\\n?\\s*brondata\\s*:[\\s\\S]*$/i, "")'),
  "rapportsanitizer kapt nog steeds alles af vanaf Brondata:"
);
assert(
  reportPage.includes('"BESTUURLIJK DEBAT"'),
  "rapportpagina mist Bestuurlijk debat in voorkeurssecties"
);
assert(
  reportPage.includes('"BOARDROOM SUMMARY"'),
  "rapportpagina mist Boardroom summary in voorkeurssecties"
);
assert(
  boardroomView.includes('split(/\\n(?=Interventie\\s+\\d+)/i)'),
  "BoardroomView parseert labeled intervention blocks nog niet"
);
assert(
  strategyView.includes('split(/\\n(?=Interventie\\s+\\d+)/i)'),
  "StrategyReportView parseert labeled intervention blocks nog niet"
);
assert(
  reportPage.includes("function sanitizeEncoding"),
  "rapportpagina mist encoding sanitizer"
);
assert(
  reportPage.includes("function stripPromptLeakageBlocks"),
  "rapportpagina mist prompt leakage filter"
);
assert(
  reportPage.includes('return match.replace(title, "90-DAGEN INTERVENTIEPLAN")'),
  "rapportpagina consolideert interventietitels nog niet"
);
assert(
  boardroomView.includes('{compact ? "Bestuurlijk overzicht" : "Board memo"}'),
  "BoardroomView gebruikt geen compact label voor bestuurlijk overzicht"
);
assert(
  boardroomView.includes('[0, 1, 2, 6, 7, 8, 17].includes(section.id)'),
  "compact boardroomweergave toont nog teveel secties"
);
assert(
  reportPage.includes("function buildScenarioViewSections("),
  "rapportpagina mist expliciete scenario-view builder"
);
assert(
  reportPage.includes("function buildTechnicalFallbackSections("),
  "rapportpagina mist technische fallbacksecties"
);
assert(
  reportPage.includes("function enforceSingleBoardThesis("),
  "rapportpagina mist single-thesis enforcement"
);
assert(
  reportPage.includes("function buildExecutiveSummaryExport(model: ReportViewModel): string") &&
    reportPage.includes("`Besluit: ${model.bestuurlijkeBesliskaart.recommendedChoice}`"),
  "rapportpagina bouwt de bestuurlijke kernsamenvatting niet expliciet op"
);
assert(
  reportPage.includes("gemeentenportfolio") &&
    reportPage.includes("maximale flexratio"),
  "rapportpagina mist gemeentenportfolio/flexratio killer insights"
);
assert(
  reportPage.includes("Consortiumtriage kan meer casussen toewijzen dan teams binnen de caseloadnorm aankunnen"),
  "actieplanmechanisme is nog te generiek"
);
assert(
  reportPage.includes("strategySections: model.scenarioSections.length ? model.scenarioSections : model.strategySections"),
  "scenario-tab gebruikt nog geen scenarioSections-fallback"
);
assert(
  reportPage.includes("function renderExpandedReport(session: (typeof mergedReports)[number])"),
  "rapportpagina mist gedeelde detailweergave voor rapporttypes"
);
assert(
  reportPage.includes('{matchesReportSelection(session, selectedSessionId) ? renderExpandedReport(session) : null}'),
  "geuploade rapporten tonen geen volledige dossierweergave"
);
assert(
  reportPage.includes('navigate(buildPortalReportPath(targetId, "short"), {') &&
    reportPage.includes('setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }))'),
  "rapportkaart opent niet standaard in snelle weergave"
);
assert(
  strategyView.includes("reportViewStyles.section.root"),
  "strategische rapportweergave gebruikt de gedeelde rustige sectiestijl niet"
);
assert(
  fs.readFileSync(path.resolve(process.cwd(), "src/components/reports/EngineAnalysisView.tsx"), "utf8").includes("reportViewStyles.panel.root"),
  "technische analyse gebruikt nog geen rustige paneelstijl"
);

console.log("report render quality regression passed");
