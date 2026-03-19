import { compactBoardroomBody, normalizeBoardroomBullet, normalizeBoardroomSentence } from "@/aurelius/executive/BoardroomLanguageNormalizer";
import type { BoardroomActionDocument, BoardroomDocument, BoardroomScenarioDocument } from "@/types/BoardroomDocument";

type ScenarioMemoRow = {
  code: string;
  title: string;
  explanation: string;
};

export type BoardroomMemoViewModel = {
  metaLine: string;
  executiveSummary: string[];
  coreProblem: string;
  decision: string;
  why: string[];
  riskOfInaction: string[];
  scenarios: ScenarioMemoRow[];
  mechanism: string[];
  stopRules: string[];
  actions: string[];
  boardQuestion: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanDisplayText(value: unknown): string {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/•/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) =>
      !/^(?:\d+\.\s+)?(?:Boardroom summary|Executive Decision Card|Strategisch Verhaal|Scenariovergelijking|onderliggende oorzaak Analyse|Bestuurlijke Acties|Verdieping|CORE PROBLEM|STRATEGIC TENSION|RECOMMENDED DECISION|WHY THIS DECISION|STOP RULES|SITUATIE|SPANNING|DYNAMIEK|KEUZE|BESTUURLIJKE OPGAVE|KILLER INSIGHTS|EARLY SIGNALS|BOARDROOM STRESSTEST|CAUSALE KETEN)$/i.test(
        line
      )
    )
    .join(" ")
    .replace(/\b(?:Organisatie|Sector|Analyse datum|Aanbevolen keuze)\s*:[^.]+/gi, "")
    .replace(/\b(?:Actie|Scenario)\s+[A-Z0-9]+\b\s*[-—]?\s*/g, "")
    .replace(/\b(?:CORE PROBLEM|STRATEGIC TENSION|RECOMMENDED DECISION|WHY THIS DECISION|STOP RULES)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSentences(value: unknown): string[] {
  return cleanDisplayText(value)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^(Organisatie|Sector|Analyse datum|Aanbevolen keuze)\s*:/i.test(part));
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = normalize(line).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compressBoardLanguage(value: unknown, max = 160): string {
  return normalizeBoardroomSentence(cleanDisplayText(value), max)
    .replace(/^Welke gemeenten zijn strategische kern,?\s*/i, "Bepaal direct welke gemeenten strategische kern zijn. ")
    .replace(/waar vergroot de organisatie alleen nog capaciteit onder harde voorwaarden,?\s*/i, "Vergroot capaciteit alleen onder harde voorwaarden. ")
    .replace(/en waar moet zij instroomroute of zorgmodel veranderen om teamstabiliteit en uitvoerbaarheid te beschermen\??/i, "Pas instroomroute of zorgmodel aan om teamstabiliteit te beschermen.")
    .replace(/gegeven de huidige operationele druk, contractstructuren en capaciteitslimieten is /i, "")
    .replace(/verdere verslechtering onvermijdelijk als het bestuur niet ingrijpt\./i, "Zonder ingreep verslechtert het systeem verder.")
    .replace(/de enige verdedigbare keuze is /i, "")
    .replace(/deze keuze volgt direct uit de structurele beperkingen in het systeem\.?/i, "")
    .replace(/dit is de enige werkbare route\.?/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractMechanismBullets(value: string): string[] {
  const chainMatch = value.match(/CAUSALE KETEN([\s\S]*)$/i);
  const source = chainMatch ? chainMatch[1] : value;
  const explicit = source
    .split(/\n+/)
    .map((line) => line.replace(/^•\s*/, "").trim())
    .filter(Boolean)
    .map((line) => compressBoardLanguage(line, 110))
    .filter((line) => line.length > 12)
    .filter((line) => !/^The real strategic tension/i.test(line))
    .filter((line) => !/^[A-C]:\s*/i.test(line))
    .slice(0, 4);
  if (explicit.length) return explicit;
  return extractSentences(value).map((line) => compressBoardLanguage(line, 110)).slice(0, 4);
}

function buildWhyBullets(doc: BoardroomDocument): string[] {
  const source = [
    ...extractMechanismBullets(doc.mechanismAnalysis),
    ...extractSentences(doc.breakthroughInsights).map((line) => compressBoardLanguage(line, 110)),
  ];
  return uniqueLines(source).slice(0, 4);
}

function buildRiskOfInaction(doc: BoardroomDocument): string[] {
  return uniqueLines(
    [
      doc.decision.inevitability,
      ...doc.stopRuleItems,
      ...extractSentences(doc.boardStressTest),
    ].map((line) => compressBoardLanguage(line, 100))
  ).slice(0, 4);
}

function buildScenarioRows(scenarios: BoardroomScenarioDocument[]): ScenarioMemoRow[] {
  return (scenarios || []).slice(0, 3).map((scenario, index) => ({
    code: String.fromCharCode(65 + index),
    title: compressBoardLanguage(cleanDisplayText(scenario.title).replace(/^Scenario [A-Z] -\s*/i, ""), 70),
    explanation: compressBoardLanguage(scenario.mechanism || scenario.risk || scenario.governanceImplication, 100),
  }));
}

function buildActionBullets(actions: BoardroomActionDocument[]): string[] {
  return uniqueLines(
    (actions || [])
      .slice(0, 3)
      .map((action) => `${cleanDisplayText(action.action)} ${cleanDisplayText(action.kpi)}`.trim())
      .filter(Boolean)
      .map((line) => normalizeBoardroomBullet(line, 110))
  ).slice(0, 3);
}

function buildExecutiveSummary(doc: BoardroomDocument): string[] {
  return uniqueLines([
    compactBoardroomBody(cleanDisplayText(doc.strategicSituation), { maxParagraphs: 1, maxCharsPerParagraph: 170 }),
    compressBoardLanguage(doc.executiveDecisionCard.summary || doc.decision.tradeOff, 150),
    `De enige verdedigbare keuze is: ${compressBoardLanguage(doc.decision.forcedDecision, 120).replace(/[.]$/, "")}.`,
  ]).slice(0, 3);
}

export function formatBoardroomMemo(document: BoardroomDocument): BoardroomMemoViewModel {
  const metaLine = `${document.meta.organizationName} • ${document.meta.sector} • ${new Date(document.meta.analysisDate).toLocaleDateString("nl-NL")}`;
  return {
    metaLine,
    executiveSummary: buildExecutiveSummary(document),
    coreProblem: compressBoardLanguage(document.decision.tradeOff || document.strategicTension, 150),
    decision: compressBoardLanguage(document.decision.forcedDecision, 150),
    why: buildWhyBullets(document),
    riskOfInaction: buildRiskOfInaction(document),
    scenarios: buildScenarioRows(document.scenarioCards),
    mechanism: extractMechanismBullets(document.mechanismAnalysis),
    stopRules: uniqueLines(
      (document.decision.breakpoints.length ? document.decision.breakpoints : document.stopRuleItems)
        .map((line) => normalizeBoardroomBullet(line, 100))
    ).slice(0, 3),
    actions: buildActionBullets(document.actionItems),
    boardQuestion: compressBoardLanguage(document.executiveDecisionCard.decisionQuestion || document.decision.inevitability, 140),
  };
}
