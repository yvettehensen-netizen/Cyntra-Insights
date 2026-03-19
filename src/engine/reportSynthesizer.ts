import type { CompactScenario, ReportRenderModel } from "@/components/reports/types";
import { ensureContentIntegrity } from "@/engine/contentIntegrityGuard";
import type { StrategicReport } from "@/types/StrategicReport";
import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";

const MIN_SCENARIOS = 3;
const DEFAULT_CHAIN = [
  "Contractstructuur",
  "Reistijd & no-show",
  "Caseload per team",
  "Teamdruk en retentie",
  "Marge en bestuurbaarheid",
];

function normalizeText(value?: string, fallback = ""): string {
  const candidate = sanitizeReportOutput(String(value ?? fallback));
  return candidate.trim();
}

function ensureCleanText(value: string, label: string): string {
  return ensureContentIntegrity(value, label);
}

function ensureSentence(value?: string, fallback?: string): string {
  const text = normalizeText(value, fallback || "");
  if (!text) return fallback ?? "";
  if (/[.!?]$/.test(text)) return text;
  return `${text}.`;
}

function cleanBlock(value?: string, fallback = ""): string {
  return sanitizeReportOutput(String(value ?? fallback)).trim();
}

function parseAxes(value?: string): { axisA: string; axisB: string } {
  const raw = normalizeText(value);
  if (!raw) return { axisA: "Strategische ambitie", axisB: "Operationele capaciteit" };
  const parts = raw.split(/versus|vs\.?|tegen|tegenover|vs\b/i).map((item) => item.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      axisA: parts[0],
      axisB: parts[1],
    };
  }
  return {
    axisA: raw,
    axisB: raw,
  };
}

const MIN_SECTION_LENGTH_FOR_STRUCTURE = 30;
const EXECUTIVE_CORE_FALLBACK =
  "Strategische kern niet beschikbaar; aanvullende analyse schetst de centrale these om het bestuur te ondersteunen.";
const DECISION_QUESTION_FALLBACK =
  "Welke bestuurlijke keuze is nodig om de strategische spanning tussen ambitie en operatie te adresseren?";
const SITUATION_FALLBACK = "De situatie vereist bestuurlijke herijking en een gedeelde interpretatie van de feiten.";
const MIN_SCENARIO_FIELD_LENGTH = Math.ceil(MIN_SECTION_LENGTH_FOR_STRUCTURE / 2);
function ensureStructuredSection(
  candidates: Array<string | undefined>,
  fallback: string,
  minLength = MIN_SECTION_LENGTH_FOR_STRUCTURE
): string {
  const normalizedParts = candidates.map((candidate) => normalizeText(candidate)).filter(Boolean);
  const ready = normalizedParts.find((text) => text.length >= minLength);
  if (ready) {
    return ensureSentence(ready, fallback);
  }
  if (normalizedParts.length) {
    const combined = normalizedParts.join(" ");
    if (combined.length >= minLength) {
      return ensureSentence(combined, fallback);
    }
  }
  return ensureSentence(fallback);
}

function ensureScenarioField(value?: string, fallback = "", minLength = MIN_SCENARIO_FIELD_LENGTH): string {
  const candidate = normalizeText(value);
  if (candidate.length >= minLength) {
    return candidate;
  }
  const fallbackCandidate = normalizeText(fallback);
  if (fallbackCandidate.length >= minLength) {
    return fallbackCandidate;
  }
  return candidate || fallbackCandidate;
}

function buildCausalChain(model: ReportRenderModel): string[] {
  const bestuurlijke = model.bestuurlijkeBesliskaart || {
    coreProblem: "",
    coreStatement: "",
    whyReasons: [],
    stopRules: [],
  };
  const reasons = [
    bestuurlijke.coreProblem,
    bestuurlijke.coreStatement,
    bestuurlijke.whyReasons?.[0],
    model.strategyAlert,
    model.boardDecisionPressure?.operational,
    model.boardDecisionPressure?.financial,
    model.boardDecisionPressure?.organizational,
  ]
    .map((item) => normalizeText(item))
    .filter(Boolean);

  const unique = Array.from(new Set([...reasons, ...DEFAULT_CHAIN])).slice(0, 5);
  return unique;
}

function dedupeScenarios(scenarios: CompactScenario[]): CompactScenario[] {
  const seen = new Set<string>();
  return scenarios.filter((scenario) => {
    const key = normalizeText(scenario.title).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildScenarioFallbackContexts(model: ReportRenderModel) {
  const options = model.boardOptions || [];
  const fallbackThemes = [...options];
  if (!fallbackThemes.length) {
    if (model.recommendedDirection) fallbackThemes.push(model.recommendedDirection);
    else if (model.strategyAlert) fallbackThemes.push(model.strategyAlert);
    else fallbackThemes.push("focus op kern en uitvoerbaarheid");
  }
  const tensionSource =
    model.strategicConflict ||
    model.bestuurlijkeBesliskaart?.coreProblem ||
    model.boardQuestion ||
    "strategische spanning tussen ambitie en operatie";
  const operational = model.boardDecisionPressure?.operational || "operationele capaciteit";
  const financial = model.boardDecisionPressure?.financial || "financiële marge";
  const organizational = model.boardDecisionPressure?.organizational || "organisatie";
  const question = model.boardQuestion || "Het bestuur moet focus aanbrengen";

  return Array.from({ length: MIN_SCENARIOS }, (_, index) => {
    const theme = fallbackThemes[index] || fallbackThemes[index % fallbackThemes.length] || "focus op gist";
    const normalizedTheme = normalizeText(theme) || `focus ${index + 1}`;
    return {
      title: `Scenario ${index + 1} — ${normalizedTheme}`,
      mechanism: ensureSentence(
        `${normalizedTheme} vergroot de spanning rond ${tensionSource}, waardoor ${operational} en ${financial} onder druk komen te staan.`
      ),
      risk: ensureSentence(
        `Zonder duidelijke grenzen loopt ${financial} terug en wordt ${operational} kwetsbaar als ${normalizedTheme} niet binnen contractdiscipline blijft.`
      ),
      governanceImplication: ensureSentence(
        `${question} door ${normalizedTheme.toLowerCase()} concreet te maken en marges, wachttijd én caseload in lockstep te sturen.`
      ),
    };
  });
}

export function synthesizeStrategicReport(rawEngineOutput: ReportRenderModel | any): StrategicReport {
  const model = (rawEngineOutput || {}) as ReportRenderModel;
  const raw = rawEngineOutput || {};
  const bestuurlijke = model.bestuurlijkeBesliskaart || {
    coreProblem: "",
    coreStatement: "",
    whyReasons: [],
    stopRules: [],
  };
  const meta = {
    organisation: normalizeText(model.organizationName, "Unknown organisatie"),
    sector: normalizeText(model.sector, "General"),
    reportId: normalizeText(model.sessionId, "unknown-report"),
    analysisDate: normalizeText(model.createdAt, new Date().toISOString()),
  };

  const executiveCore = ensureStructuredSection(
    [model.executiveSummary, model.strategyAlert, bestuurlijke.coreProblem, bestuurlijke.coreStatement],
    EXECUTIVE_CORE_FALLBACK
  );
  const decisionQuestion = ensureStructuredSection(
    [
      model.boardQuestion,
      model.strategicConflict,
      bestuurlijke.coreProblem,
      bestuurlijke.coreStatement,
      DECISION_QUESTION_FALLBACK,
    ],
    DECISION_QUESTION_FALLBACK
  );
  const situation = ensureStructuredSection(
    [model.executiveSummary, model.strategyAlert, bestuurlijke.coreProblem, bestuurlijke.coreStatement],
    SITUATION_FALLBACK
  );

  const tensionSource =
    model.strategicConflict ||
    bestuurlijke.coreStatement ||
    bestuurlijke.coreProblem ||
    raw.strategicConflict ||
    raw.coreStatement ||
    raw.coreProblem ||
    raw.executiveSummary ||
    "";
  const tensionAxes = parseAxes(tensionSource);
  const tensionExplanation = ensureSentence(
    tensionSource || raw.executiveSummary || raw.coreProblem,
    "De spanning ligt tussen strategische ambitie en operationele capaciteit."
  );

  const mechanismExplanationSource =
    raw.mechanism ||
    raw.keyInsight ||
    bestuurlijke.coreProblem ||
    bestuurlijke.coreStatement ||
    model.strategyAlert ||
    model.executiveSummary;
  const causalChainSource =
    Array.isArray(raw.causalChain) && raw.causalChain.length
      ? raw.causalChain.map((item) => normalizeText(String(item)))
      : buildCausalChain(model);
  const mechanismAnalysis = {
    coreMechanism: ensureCleanText(ensureSentence(
      mechanismExplanationSource,
      "Het kernmechanisme verbindt strategische keuzes met operationele druk."
    ), "mechanismAnalysis.coreMechanism"),
    explanation: ensureCleanText(ensureSentence(
      mechanismExplanationSource,
      "Het kernmechanisme verbindt strategische keuzes met operationele druk."
    ), "mechanismAnalysis.explanation"),
    causalChain: causalChainSource.map((item, index) => ensureCleanText(item, `mechanismAnalysis.causalChain[${index}]`)),
    boardInterpretation: ensureCleanText(ensureSentence(
      model.boardQuestion || model.strategyAlert || mechanismExplanationSource,
      "Het bestuur moet dit mechanisme vertalen naar expliciete sturing."
    ), "mechanismAnalysis.boardInterpretation"),
  };

  const uniqueScenarios = dedupeScenarios(model.compactScenarios || []);
  const fallbackContexts = buildScenarioFallbackContexts(model);
  const paddedScenarios = [...uniqueScenarios];
  while (paddedScenarios.length < MIN_SCENARIOS) {
    paddedScenarios.push({
      title: "",
      mechanism: "",
      risk: "",
      boardImplication: "",
    });
  }

  const scenarios = paddedScenarios.slice(0, Math.max(MIN_SCENARIOS, paddedScenarios.length)).map((scenario, index) => ({
    title: ensureCleanText(ensureSentence(
      ensureScenarioField(scenario.title, fallbackContexts[index]?.title),
      fallbackContexts[index]?.title
    ), `scenarios[${index}].title`),
    mechanism: ensureCleanText(ensureSentence(
      ensureScenarioField(scenario.mechanism, fallbackContexts[index]?.mechanism),
      fallbackContexts[index]?.mechanism
    ), `scenarios[${index}].mechanism`),
    risk: ensureCleanText(ensureSentence(
      ensureScenarioField(scenario.risk, fallbackContexts[index]?.risk),
      fallbackContexts[index]?.risk
    ), `scenarios[${index}].risk`),
    governanceImplication: ensureCleanText(ensureSentence(
      ensureScenarioField(
        scenario.boardImplication,
        fallbackContexts[index]?.governanceImplication
      ),
      fallbackContexts[index]?.governanceImplication
    ), `scenarios[${index}].governanceImplication`),
    impactScore: scenario.impactScore,
    impact: scenario.impactScore,
    riskScore: scenario.riskScore,
    executionScore: scenario.difficultyScore,
    execution: scenario.difficultyScore,
  }));

  const rawInsights = model.structuredKillerInsights || [];
  const insights = rawInsights.map((item) => ({
    insight: ensureCleanText(ensureSentence(item.insight, "Strategisch inzicht"), "insights.insight"),
    whyItMatters: ensureCleanText(ensureSentence(item.mechanism, "Waarom dit belangrijk is"), "insights.whyItMatters"),
    governanceConsequence: ensureCleanText(ensureSentence(item.implication, "Bestuurlijke implicatie"), "insights.governanceConsequence"),
  }));
  while (insights.length < 5) {
    insights.push({
      insight: "Extra strategisch inzicht is nog in de analysefase.",
      whyItMatters: "Vervolgdata zijn nog niet beschikbaar om dit verder te onderbouwen.",
      governanceConsequence: "Bestuur bepaalt nadere focus zodra extra data beschikbaar is.",
    });
  }

  const governanceImplications = insights
    .map((item) => ({
      strategicImpact: item.insight,
      governanceQuestion: item.whyItMatters,
      decisionMoment: item.governanceConsequence,
    }))
    .slice(0, 4);

  const actions = (model.governanceInterventions || []).map((item) => ({
    action: ensureCleanText(ensureSentence(item.action, "Actie"), "actions.action"),
    owner: ensureCleanText(normalizeText(item.owner, "Bestuur"), "actions.owner"),
    deadline: ensureCleanText(normalizeText(item.deadline, "90 dagen"), "actions.deadline"),
    kpi: ensureCleanText(ensureSentence(item.kpi, "KPI niet gespecificeerd"), "actions.kpi"),
  }));

  const stopRules = (bestuurlijke.stopRules || [])
    .map((rule, index) => ensureCleanText(sanitizeReportOutput(rule), `stopRules[${index}]`))
    .filter(Boolean);

  return {
    meta,
    executiveCore: ensureCleanText(executiveCore, "executiveCore"),
    decisionQuestion: ensureCleanText(decisionQuestion, "decisionQuestion"),
    situation: ensureCleanText(situation, "situation"),
    strategicTension: {
      axisA: ensureCleanText(tensionAxes.axisA, "strategicTension.axisA"),
      axisB: ensureCleanText(tensionAxes.axisB, "strategicTension.axisB"),
      explanation: ensureCleanText(tensionExplanation, "strategicTension.explanation"),
    },
    mechanismAnalysis,
    scenarios,
    breakthroughInsights: insights,
    insights,
    governanceImplications,
    boardActions: actions,
    actions,
    stopRules,
  };
}
