export interface AureliusResult {
  executive_summary: string;
  board_memo: string;
  strategic_conflict: string;
  recommended_option: string;
  interventions: any[];
  strategic_levers?: any[];
  strategy_dna?: any;
  causal_analysis?: any;
  scenario_simulation?: any;
  benchmark?: any;
  drift_analysis?: any;
  decision_memory?: any;
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
  killer_insights?: string[];
  killer_insights_meta?: {
    score: number;
    failed_checks: string[];
    evidence_used: number;
  };
  roadmap_90d?: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  decision_pressure?: {
    explicit_decision_required: boolean;
    execution_risk_high: boolean;
    governance_blocking: boolean;
  };
  execution_risks?: string[];
  confidence_score?: number;
  board_memo_quality?: {
    score: number;
    findings: string[];
  };
  decision_card_id?: string;
  strategic_depth_score?: number;
  strategic_reasoning_gate_passed?: boolean;
  strategic_warnings?: string[];
  thesis?: string;
  conflict?: string;
  decision?: string;
  boardQuestion?: string;
  stressTest?: string;
  intervention_actions?: string[];
  strategic_lever_combination?: any;
  causal_strategy?: any;
  recommendations?: string[];
  ceo_message?: string;
}

type UnknownRecord = Record<string, unknown>;

const DEFAULT_EXECUTIVE_SUMMARY =
  "Strategische analyse voltooid. Executive summary automatisch aangevuld om het UI-contract stabiel te houden.";
const DEFAULT_BOARD_MEMO =
  "Board memo automatisch aangevuld. Gebruik executive summary, strategisch conflict en interventies als minimale besluitbasis.";
const DEFAULT_STRATEGIC_CONFLICT =
  "Strategisch conflict niet expliciet aangeleverd. Kies tussen focus, capaciteit en executiediscipline.";
const DEFAULT_RECOMMENDED_OPTION = "C";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function asString(value: unknown, fallback = ""): string {
  const text = normalizeText(value);
  return text || fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function pickNested(source: unknown, path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (!isRecord(current) || !(key in current)) return undefined;
    current = current[key];
  }
  return current;
}

function pickFirst(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    const value = pickNested(source, path);
    if (typeof value === "string" && normalizeText(value)) return value;
    if (Array.isArray(value) && value.length) return value;
    if (isRecord(value) && Object.keys(value).length) return value;
  }
  return undefined;
}

function normalizeRoadmap(value: unknown): AureliusResult["roadmap_90d"] {
  if (Array.isArray(value)) {
    const items = asStringArray(value);
    return {
      month1: items.slice(0, 7),
      month2: items.slice(7, 14),
      month3: items.slice(14, 21),
    };
  }

  if (isRecord(value)) {
    return {
      month1: asStringArray(value.month1 ?? value.maand1 ?? value.phase1),
      month2: asStringArray(value.month2 ?? value.maand2 ?? value.phase2),
      month3: asStringArray(value.month3 ?? value.maand3 ?? value.phase3),
    };
  }

  return { month1: [], month2: [], month3: [] };
}

function normalizeInterventions(value: unknown): any[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") {
          const title = normalizeText(item);
          if (!title) return null;
          return {
            id: `intervention-${index + 1}`,
            title,
            description: title,
          };
        }
        if (isRecord(item)) return item;
        return null;
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && normalizeText(value)) {
    return normalizeText(value)
      .split(/\n+/)
      .map((line) => normalizeText(line.replace(/^[-*\d.)\s]+/, "")))
      .filter(Boolean)
      .map((title, index) => ({ id: `intervention-${index + 1}`, title, description: title }));
  }

  return [];
}

function buildBoardMemo(input: {
  executive_summary: string;
  strategic_conflict: string;
  recommended_option: string;
  interventions: any[];
}): string {
  const interventions = input.interventions
    .slice(0, 3)
    .map((item) => {
      if (isRecord(item)) return asString(item.title ?? item.interventie ?? item.description, "Interventie");
      return asString(item, "Interventie");
    })
    .filter(Boolean);

  return [
    "Bestuurlijke hypothese",
    input.executive_summary,
    "",
    "Kernconflict (A/B keuze)",
    input.strategic_conflict,
    "",
    "Besluitvoorstel",
    `Aanbevolen optie: ${input.recommended_option}`,
    "",
    "Opvolging 90 dagen",
    interventions.length ? interventions.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Interventies volgen.",
  ]
    .join("\n")
    .trim();
}

export function normalizeAureliusResultContract(raw: unknown): AureliusResult {
  const source = isRecord(raw) ? raw : {};

  const executive_summary = asString(
    pickFirst(source, [
      ["executive_summary"],
      ["summary"],
      ["samenvatting"],
      ["executive_truth"],
      ["narrative", "executive_summary"],
    ]),
    DEFAULT_EXECUTIVE_SUMMARY
  );

  const strategic_conflict = asString(
    pickFirst(source, [
      ["strategic_conflict"],
      ["conflict"],
      ["thesis"],
      ["narrative", "strategic_conflict"],
      ["forced_choices", "cost_of_inaction"],
    ]),
    DEFAULT_STRATEGIC_CONFLICT
  );

  const recommended_option = asString(
    pickFirst(source, [
      ["recommended_option"],
      ["decision"],
      ["decision", "recommended_option"],
      ["decision", "preferred_option"],
      ["gekozen_strategie"],
    ]),
    DEFAULT_RECOMMENDED_OPTION
  ).slice(0, 240);

  const interventions = normalizeInterventions(
    pickFirst(source, [
      ["interventions"],
      ["intervention_predictions"],
      ["intervention_actions"],
      ["recommendations"],
      ["actions"],
      ["roadmap_90d"],
    ])
  );

  const board_memo = asString(
    pickFirst(source, [
      ["board_memo"],
      ["boardMemo"],
      ["narrative", "board_memo"],
      ["narrative", "boardroom_narrative"],
      ["ceo_message"],
    ]),
    buildBoardMemo({
      executive_summary,
      strategic_conflict,
      recommended_option,
      interventions,
    }) || DEFAULT_BOARD_MEMO
  );

  return {
    executive_summary,
    board_memo,
    strategic_conflict,
    recommended_option,
    interventions,
    strategic_levers:
      (pickFirst(source, [["strategic_levers"], ["strategic_metadata", "strategic_hefbomen"]]) as any[]) || undefined,
    strategy_dna: pickFirst(source, [["strategy_dna"], ["strategic_metadata", "strategy_dna"]]),
    causal_analysis: pickFirst(source, [["causal_analysis"], ["causal_strategy"], ["strategic_metadata", "strategic_causal_analysis"]]),
    scenario_simulation: pickFirst(source, [["scenario_simulation"], ["strategic_metadata", "strategy_simulation"]]),
    benchmark: pickFirst(source, [["benchmark"], ["benchmark_context"], ["sector_benchmark"]]),
    drift_analysis: pickFirst(source, [["drift_analysis"], ["strategic_drift"], ["drift"]]),
    decision_memory: pickFirst(source, [["decision_memory"], ["strategic_metadata", "decision_memory"]]),
    insights: asStringArray(source.insights ?? source.boardroom_summary ?? source.key_findings),
    risks: asStringArray(source.risks ?? source.key_risks ?? source.tensions),
    opportunities: asStringArray(source.opportunities ?? source.key_opportunities),
    killer_insights: asStringArray(source.killer_insights),
    killer_insights_meta: isRecord(source.killer_insights_meta)
      ? (source.killer_insights_meta as AureliusResult["killer_insights_meta"])
      : undefined,
    roadmap_90d: normalizeRoadmap(source.roadmap_90d),
    decision_pressure: isRecord(source.decision_pressure)
      ? (source.decision_pressure as AureliusResult["decision_pressure"])
      : undefined,
    execution_risks: asStringArray(source.execution_risks),
    confidence_score: typeof source.confidence_score === "number" ? source.confidence_score : undefined,
    decision_card_id: asString(source.decision_card_id),
    strategic_depth_score: typeof source.strategic_depth_score === "number" ? source.strategic_depth_score : undefined,
    strategic_reasoning_gate_passed:
      typeof source.strategic_reasoning_gate_passed === "boolean" ? source.strategic_reasoning_gate_passed : undefined,
    strategic_warnings: asStringArray(source.strategic_warnings),
    thesis: asString(source.thesis),
    conflict: asString(source.conflict || strategic_conflict),
    decision: asString(source.decision || recommended_option),
    boardQuestion: asString(source.boardQuestion),
    stressTest: asString(source.stressTest),
    intervention_actions: asStringArray(source.intervention_actions),
    strategic_lever_combination: source.strategic_lever_combination,
    causal_strategy: source.causal_strategy,
    recommendations: asStringArray(source.recommendations),
    ceo_message: asString(source.ceo_message),
  };
}
