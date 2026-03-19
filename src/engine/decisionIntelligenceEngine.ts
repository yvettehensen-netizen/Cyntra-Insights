import type {
  BoardroomDecisionIntelligence,
  BoardroomDocument,
  BoardroomScenarioDocument,
} from "@/types/BoardroomDocument";
import { ensureContentIntegrity } from "@/engine/contentIntegrityGuard";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ensureSentence(value: string): string {
  const text = normalize(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function sanitizeDecisionLine(value: string, label: string): string {
  const text = ensureSentence(value);
  return ensureContentIntegrity(text, label);
}

function asSingleBlock(value: string): string {
  return normalize(value).replace(/\n+/g, " ");
}

function pickRecommendedScenario(doc: BoardroomDocument): BoardroomScenarioDocument | undefined {
  const scored = [...(doc.scenarioCards || [])].sort((left, right) => {
    const leftScore = (left.impactScore ?? 0) - (left.riskScore ?? 0) - (left.executionScore ?? 0);
    const rightScore = (right.impactScore ?? 0) - (right.riskScore ?? 0) - (right.executionScore ?? 0);
    return rightScore - leftScore;
  });
  return doc.recommendedScenario || scored[0];
}

function buildThesis(doc: BoardroomDocument): string {
  const thesisSource = [
    asSingleBlock(doc.executiveDecisionCard.summary),
    asSingleBlock(doc.strategicSituation),
    asSingleBlock(doc.strategicTension),
  ].find((line) => line.length > 60) || "De organisatie staat in een structureel spanningsvraagstuk dat directe bestuurlijke keuze afdwingt.";

  return sanitizeDecisionLine(
    `${thesisSource} Dit is geen beschrijving van de situatie maar de kernstelling die het bestuur nu moet dragen.`,
    "decision.thesis"
  );
}

function buildTradeOff(doc: BoardroomDocument): string {
  const scenarios = doc.scenarioCards || [];
  if (scenarios.length < 2) return "";

  const a = normalize(scenarios[0]?.title).replace(/^Scenario [A-Z] - /i, "").replace(/[.!?]+$/g, "");
  const b = normalize(scenarios[1]?.title).replace(/^Scenario [A-Z] - /i, "").replace(/[.!?]+$/g, "");

  return sanitizeDecisionLine(
    `De organisatie kan niet tegelijkertijd ${a.toLowerCase()} en ${b.toLowerCase()} realiseren zonder directe schade aan uitvoerbaarheid, marge of teamstabiliteit.`,
    "decision.tradeOff"
  );
}

function buildInevitability(doc: BoardroomDocument): string {
  const mechanism = asSingleBlock(doc.mechanismAnalysis);
  return sanitizeDecisionLine(
    `Gegeven de huidige operationele druk, contractstructuren en capaciteitslimieten is verdere verslechtering onvermijdelijk als het bestuur niet ingrijpt. ${mechanism} Niet kiezen versnelt de schade.`,
    "decision.inevitability"
  );
}

function extractBreakpoints(doc: BoardroomDocument): string[] {
  const text = JSON.stringify(doc).toLowerCase();
  const breakpoints = new Set<string>();

  for (const rule of doc.stopRuleItems || []) {
    const normalized = normalize(rule);
    if (normalized) breakpoints.add(normalized);
  }

  if (text.includes("wachttijd")) {
    breakpoints.add("wachttijd > kritische grens");
  }
  if (text.includes("marge")) {
    breakpoints.add("marge onder minimum");
  }
  if (text.includes("caseload")) {
    breakpoints.add("caseload overschrijdt capaciteit");
  }

  return [...breakpoints];
}

function buildForcedDecision(doc: BoardroomDocument, thesis: string): string {
  const best = normalize(pickRecommendedScenario(doc)?.title) || "onbekend scenario";
  const closing = thesis
    ? "Deze keuze volgt direct uit de structurele beperkingen in het systeem. Dit is de enige werkbare route."
    : "Dit is de enige werkbare route.";

  return sanitizeDecisionLine(
    `De enige verdedigbare keuze is ${best}. ${closing}`,
    "decision.forcedDecision"
  );
}

export function buildDecisionIntelligence(doc: BoardroomDocument): BoardroomDecisionIntelligence {
  const errors: string[] = [];
  const thesis = buildThesis(doc);
  if (!thesis || thesis.length < 80) {
    errors.push("MISSING_STRONG_THESIS");
  }

  const tradeOff = buildTradeOff(doc);
  if (!/kan .*niet tegelijkertijd|cannot simultaneously/i.test(tradeOff)) {
    errors.push("NO_FORCED_TRADEOFF");
  }

  const inevitability = buildInevitability(doc);
  if (!/onvermijdelijk|inevitable/i.test(inevitability)) {
    errors.push("NO_INEVITABILITY");
  }

  const breakpoints = extractBreakpoints(doc);
  if (breakpoints.length === 0) {
    errors.push("NO_BREAKPOINTS");
  }

  const forcedDecision = buildForcedDecision(doc, thesis);
  if (!/enige verdedigbare keuze|only viable path|enige werkbare route/i.test(forcedDecision)) {
    errors.push("NO_FORCED_DECISION");
  }

  return {
    thesis,
    tradeOff,
    inevitability,
    breakpoints,
    forcedDecision,
    errors,
  };
}
