export type PowerRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type PowerNodeResult = {
  content: string;
  insights: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
};

export type PowerPipelineOutput = {
  metrics: {
    conflict_intensity_score_0_100: number;
    governance_integrity_score_0_100: number;
    decision_strength_index_0_100: number;
    execution_risk_level: PowerRiskLevel;
    decision_certainty_0_1: number;
  };
  execution_layer: {
    "90_day_priorities": string[];
    measurable_outcomes: string[];
    risk_level: PowerRiskLevel;
    owner_map: string[];
  };
  node_results: {
    truth: PowerNodeResult;
    governance: PowerNodeResult;
    conflict: PowerNodeResult;
    opportunity_cost: PowerNodeResult;
    tradeoff: PowerNodeResult;
    decision_finalizer: PowerNodeResult;
  };
};

export type RunPowerPipelineInput = {
  analysisType: string;
  rawText: string;
  userContext?: Record<string, unknown>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toNode(content: string, focus: string): PowerNodeResult {
  const base = content.trim();
  return {
    content: base,
    insights: [
      `${focus}: huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd.`,
      `${focus}: inconsistentie tussen besluit en uitvoering verhoogt frictie.`
    ],
    recommendations: [
      `Leg voor ${focus.toLowerCase()} expliciet eigenaarschap en besluitmomenten vast.`,
      `Koppel ${focus.toLowerCase()} aan meetbare 30/60/90-dagen doelen.`
    ],
    risks: [
      `${focus}: uitstel vergroot herstelkosten en vertraagt executie.`,
    ],
    opportunities: [
      `${focus}: versnelde besluitdiscipline kan binnen 90 dagen aantoonbare impact geven.`,
    ],
  };
}

function inferScores(rawText: string): PowerPipelineOutput["metrics"] {
  const text = rawText.toLowerCase();
  const urgencySignals = ["urg", "risico", "conflict", "druk", "stagn", "verlies"];
  const governanceSignals = ["governance", "eigenaar", "mandaat", "besluit", "escalat", "kpi"];
  const positiveSignals = ["focus", "prioriteit", "discipline", "uitvoering", "helder"];

  const countMatches = (signals: string[]) =>
    signals.reduce((acc, signal) => acc + (text.includes(signal) ? 1 : 0), 0);

  const urgency = countMatches(urgencySignals);
  const governance = countMatches(governanceSignals);
  const positive = countMatches(positiveSignals);

  const conflict = clamp(42 + urgency * 7 - positive * 2, 20, 95);
  const integrity = clamp(35 + governance * 8 + positive * 3 - urgency * 2, 15, 95);
  const decisionStrength = clamp(Math.round((integrity * 0.55) + ((100 - conflict) * 0.45)), 20, 95);
  const certainty = clamp(Number((0.35 + (governance + positive) * 0.05 - urgency * 0.02).toFixed(2)), 0.1, 0.95);

  const executionRisk: PowerRiskLevel = conflict >= 75 ? "HIGH" : conflict >= 50 ? "MEDIUM" : "LOW";

  return {
    conflict_intensity_score_0_100: conflict,
    governance_integrity_score_0_100: integrity,
    decision_strength_index_0_100: decisionStrength,
    execution_risk_level: executionRisk,
    decision_certainty_0_1: certainty,
  };
}

export async function runPowerPipeline(
  input: RunPowerPipelineInput
): Promise<PowerPipelineOutput> {
  const safeText = String(input.rawText ?? "").trim();
  const metrics = inferScores(safeText);

  const riskLevel = metrics.execution_risk_level;
  const analysisLabel = input.analysisType || "analyse";

  return {
    metrics,
    execution_layer: {
      "90_day_priorities": [
        `Prioriteit 1: besluitkader voor ${analysisLabel} expliciet vastleggen met eigenaar en deadline.`,
        "Prioriteit 2: wekelijkse escalatieroute activeren op blokkades in capaciteit en mandaat.",
        "Prioriteit 3: executieritme op 30/60/90 dagen met meetbare KPI-review afdwingen.",
      ],
      measurable_outcomes: [
        "Binnen 30 dagen: 100% van de top-3 besluiten voorzien van owner, scope en deadline.",
        "Binnen 60 dagen: minimaal 2 blokkades per week opgelost binnen afgesproken escalatie-SLA.",
        "Binnen 90 dagen: aantoonbare verbetering op beslisdoorlooptijd en uitvoerbetrouwbaarheid.",
      ],
      risk_level: riskLevel,
      owner_map: [
        "CEO: besluitdiscipline en mandaatbewaking",
        "COO: uitvoeringsritme en blokkade-oplossing",
        "CFO: keuzeconflict validatie en opportunity-cost monitoring",
      ],
    },
    node_results: {
      truth: toNode(
        "Strategische realiteitscheck toont een gat tussen bestuurlijke intentie en operationele doorvertaling.",
        "Waarheidslaag"
      ),
      governance: toNode(
        "Governance-integriteit vraagt heldere besluitrechten, escalatiegrenzen en afdwingbaar eigenaarschap.",
        "Governance"
      ),
      conflict: toNode(
        "Machtsfrictie concentreert zich rond prioritering, mandaatduidelijkheid en informele beïnvloeding.",
        "Conflict"
      ),
      opportunity_cost: toNode(
        "Kosten van uitstel lopen op door vertraging in keuzes, herwerk en dalende executiezekerheid.",
        "Opportunity cost"
      ),
      tradeoff: toNode(
        "Keuzeconflicten moeten expliciet worden gemaakt tussen snelheid, controle en organisatiedraagvlak.",
        "Keuzeconflict"
      ),
      decision_finalizer: toNode(
        "Bestuurlijke verankering vereist één expliciet besluitcontract met tijdshorizon, KPI en faalconditie.",
        "Decision finalizer"
      ),
    },
  };
}
