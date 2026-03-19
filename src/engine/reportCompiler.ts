import type { ReportSection } from "@/components/reports/types";
import { buildDecisionIntelligence } from "@/engine/decisionIntelligenceEngine";
import { validateDecisionIntelligence } from "@/engine/reportValidator";
import type { BoardroomDocument } from "@/types/BoardroomDocument";
import type { StrategicReport } from "@/types/StrategicReport";
import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";

function normalize(value: unknown): string {
  return sanitizeReportOutput(String(value ?? "")).replace(/\s+/g, " ").trim();
}

function asParagraph(value: unknown): string {
  return sanitizeReportOutput(String(value ?? "")).replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function toParagraphs(lines: Array<string | undefined>): string {
  return lines
    .map((line) => asParagraph(line))
    .filter(Boolean)
    .join("\n\n");
}

function ensureSentence(value: unknown, fallback: string): string {
  const text = normalize(value) || normalize(fallback);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = normalize(line).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreLabel(value?: number): string {
  return Number.isFinite(value) ? String(value) : "n.b.";
}

function toScenarioTitle(title: string, index: number): string {
  const cleaned = normalize(title).replace(/^scenario\s+[a-z0-9]+\s*[—-]\s*/i, "");
  return cleaned ? `Scenario ${String.fromCharCode(65 + index)} - ${cleaned}` : `Scenario ${String.fromCharCode(65 + index)}`;
}

function splitSentences(value: string): string[] {
  return asParagraph(value)
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatMechanismAnalysis(report: StrategicReport): string {
  const explanation = ensureSentence(
    report.mechanismAnalysis?.boardInterpretation ||
      report.mechanismAnalysis?.coreMechanism ||
      report.mechanismAnalysis?.explanation,
    "Het kernmechanisme is nog niet volledig uitgewerkt."
  );
  const causalChain = dedupeLines(report.mechanismAnalysis?.causalChain || []);
  const optionBullets = dedupeLines(
    [report.strategicTension?.axisA, report.strategicTension?.axisB, report.mechanismAnalysis?.coreMechanism]
      .map((line) => normalize(line))
      .filter(Boolean)
      .slice(0, 3)
  ).map((line, index) => `${String.fromCharCode(65 + index)}. ${ensureSentence(line, line)}`);
  const explanationAlreadyFramesTension = /de echte spanning zit niet in labels,\s*maar tussen/i.test(explanation);

  const chainLines = causalChain.length
    ? [
        "CAUSALE KETEN",
        ...causalChain.map((line) => `• ${ensureSentence(line, line)}`),
      ]
    : [];

  return [
    explanation,
    optionBullets.length
      ? [
          explanationAlreadyFramesTension ? "" : "De echte spanning zit niet in labels, maar tussen:",
          ...optionBullets.map((line) => `• ${line}`),
        ].filter(Boolean).join("\n")
      : "",
    chainLines.join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatBreakthroughInsights(items: BoardroomDocument["insightItems"]): string {
  return items
    .map((item, index) =>
      [
        `Inzicht ${index + 1}`,
        ensureSentence(item.insight, "Inzicht niet beschikbaar."),
        ensureSentence(item.whyItMatters, "Waarom dit ertoe doet is niet beschikbaar."),
        ensureSentence(item.governanceConsequence, "Bestuurlijke consequentie niet beschikbaar."),
      ].join("\n\n")
    )
    .join("\n\n");
}

function formatGovernanceImplications(report: StrategicReport): string {
  return (report.governanceImplications || [])
    .slice(0, 4)
    .map((item, index) =>
      [
        `Implicatie ${index + 1}`,
        ensureSentence(item.strategicImpact, "Strategisch effect niet beschikbaar."),
        ensureSentence(item.governanceQuestion, "Governancevraag niet beschikbaar."),
        ensureSentence(item.decisionMoment, "Besluitmoment niet beschikbaar."),
      ].join("\n\n")
    )
    .join("\n\n");
}

function formatActionPlan(items: BoardroomDocument["actionItems"]): string {
  return items
    .map((item, index) =>
      [
        `Actie ${index + 1}`,
        ensureSentence(item.action, "Actie niet beschikbaar."),
        `Eigenaar: ${normalize(item.owner) || "Bestuur"}`,
        `Deadline: ${normalize(item.deadline) || "90 dagen"}`,
        `KPI: ${ensureSentence(item.kpi, "KPI niet beschikbaar.")}`,
      ].join("\n")
    )
    .join("\n\n");
}

function formatBreakpoints(items: string[]): string {
  return items.map((item, index) => `Breakpoint ${index + 1}\n${ensureSentence(item, item)}`).join("\n\n");
}

function formatScenarioComparison(scenarios: BoardroomDocument["scenarioCards"]): string {
  return scenarios
    .map((scenario) =>
      [
        scenario.title,
        `• Mechanisme: ${ensureSentence(scenario.mechanism, "Mechanisme niet beschikbaar.")}`,
        `• Risico: ${ensureSentence(scenario.risk, "Risico niet beschikbaar.")}`,
        `• Bestuurlijke implicatie: ${ensureSentence(
          scenario.governanceImplication,
          "Bestuurlijke implicatie niet beschikbaar."
        )}`,
        `• Scores: Impact ${scoreLabel(scenario.impactScore)} | Risico ${scoreLabel(scenario.riskScore)} | Uitvoering ${scoreLabel(scenario.executionScore)}`,
      ].join("\n")
    )
    .join("\n\n");
}

function buildBaseDocument(report: StrategicReport): Omit<BoardroomDocument, "decision"> {
  const scenarios = (report.scenarios || []).slice(0, 3).map((scenario, index) => ({
    title: toScenarioTitle(scenario.title, index),
    mechanism: ensureSentence(scenario.mechanism, "Mechanisme niet beschikbaar."),
    risk: ensureSentence(scenario.risk, "Risico niet beschikbaar."),
    governanceImplication: ensureSentence(
      scenario.governanceImplication,
      "Bestuurlijke implicatie niet beschikbaar."
    ),
    impactScore: scenario.impactScore ?? scenario.impact,
    riskScore: scenario.riskScore,
    executionScore: scenario.executionScore ?? scenario.execution,
  }));
  const insights = (report.breakthroughInsights || report.insights || []).slice(0, 5);
  const boardActions = (report.boardActions || report.actions || []).slice(0, 4);
  const stopRuleItems = dedupeLines((report.stopRules || []).map((rule) => asParagraph(rule)));
  const insightItems = insights.map((item) => ({
    insight: ensureSentence(item.insight, "Inzicht niet beschikbaar."),
    whyItMatters: ensureSentence(item.whyItMatters, "Waarom dit ertoe doet is niet beschikbaar."),
    governanceConsequence: ensureSentence(item.governanceConsequence, "Bestuurlijke consequentie niet beschikbaar."),
  }));
  const actionItems = boardActions.map((item) => ({
    action: ensureSentence(item.action, "Actie niet beschikbaar."),
    owner: normalize(item.owner) || "Bestuur",
    deadline: normalize(item.deadline) || "90 dagen",
    kpi: ensureSentence(item.kpi, "KPI niet beschikbaar."),
  }));
  const recommendedScenario = [...scenarios].sort((left, right) => {
    const leftScore = (left.impactScore ?? 0) - (left.riskScore ?? 0) - (left.executionScore ?? 0);
    const rightScore = (right.impactScore ?? 0) - (right.riskScore ?? 0) - (right.executionScore ?? 0);
    return rightScore - leftScore;
  })[0];

  return {
    meta: {
      organizationName: normalize(report.meta?.organisation) || "Onbekende organisatie",
      sector: normalize(report.meta?.sector) || "Onbekende sector",
      reportId: normalize(report.meta?.reportId) || "Onbekend rapport",
      analysisDate: normalize(report.meta?.analysisDate) || new Date().toISOString(),
    },
    executiveDecisionCard: {
      summary: ensureSentence(report.executiveCore, "Executive kern ontbreekt."),
      decisionQuestion: ensureSentence(report.decisionQuestion, "Besluitvraag ontbreekt."),
    },
    strategicSituation: ensureSentence(
      report.situation,
      "De strategische situatie vraagt bestuurlijke duiding."
    ),
    strategicTension: toParagraphs([
      `${normalize(report.strategicTension?.axisA) || "Strategische ambitie"} versus ${normalize(report.strategicTension?.axisB) || "Operationele capaciteit"}`,
      ensureSentence(
        report.strategicTension?.explanation,
        "De spanning ligt tussen ambitie, capaciteit en bestuurlijke discipline."
      ),
    ]),
    mechanismAnalysis: formatMechanismAnalysis(report),
    scenarioComparison: formatScenarioComparison(scenarios),
    breakthroughInsights: formatBreakthroughInsights(insightItems),
    governanceImplications: formatGovernanceImplications(report),
    boardActionPlan: formatActionPlan(actionItems),
    stopRules: stopRuleItems.map((rule) => `- ${rule}`).join("\n"),
    stopRuleItems,
    scenarioCards: scenarios,
    recommendedScenario,
    actionItems,
    insightItems,
  };
}

export function compileBoardroomDocument(report: StrategicReport): BoardroomDocument {
  const base = buildBaseDocument(report);
  const decision = buildDecisionIntelligence(base as BoardroomDocument);
  validateDecisionIntelligence(decision);

  return {
    ...base,
    executiveDecisionCard: {
      summary: decision.forcedDecision,
      decisionQuestion: base.executiveDecisionCard.decisionQuestion,
    },
    decision,
  };
}

export function buildBoardroomSections(document: BoardroomDocument): ReportSection[] {
  return [
    { title: "EXECUTIVE THESIS", body: document.decision.thesis },
    { title: "STRATEGIC CONFLICT", body: document.decision.tradeOff },
    { title: "MECHANISME ANALYSE", body: document.mechanismAnalysis },
    { title: "INEVITABILITY", body: document.decision.inevitability },
    { title: "BREAKPOINTS", body: formatBreakpoints(document.decision.breakpoints) },
    {
      title: "DECISION",
      body: document.decision.forcedDecision,
    },
    { title: "SCENARIOVERGELIJKING", body: document.scenarioComparison },
    { title: "BESTUURLIJKE ACTIES", body: document.boardActionPlan },
  ].filter((section) => normalize(section.body));
}
