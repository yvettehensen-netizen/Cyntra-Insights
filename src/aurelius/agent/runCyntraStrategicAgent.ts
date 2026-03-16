import type { AnalysisContext } from "@/aurelius/engine/types";
import type { BoardroomInput } from "@/aurelius/narrative/generateBoardroomNarrative";
import { generateBoardroomNarrative } from "@/aurelius/narrative/generateBoardroomNarrative";
import { buildBoardroomBrief } from "@/aurelius/synthesis/buildBoardroomBrief";
import type { RunCyntraResult } from "@/aurelius/hooks/useCyntraAnalysis";
import {
  StrategicMechanismLayer,
  type StrategicDiagnosisState,
  type StrategicMechanismRecord,
} from "./StrategicMechanismLayer";
import {
  StrategicInsightLayer,
  type StrategicInsightRecord,
} from "./StrategicInsightLayer";
import {
  StrategicDecisionLayer,
  type StrategicDecisionRecord,
  attachSimulationAndPatterns,
} from "./StrategicDecisionLayer";
import { StrategicSimulationEngine } from "@/aurelius/simulation/StrategicSimulationEngine";
import {
  StrategicMemoryStore,
  type StrategicCase,
} from "@/aurelius/intelligence/StrategicMemoryStore";
import {
  StrategicMemoryRetriever,
  type RetrievedStrategicCase,
} from "@/aurelius/intelligence/StrategicMemoryRetriever";
import {
  StrategicPatternEngine,
  type StrategicPattern,
} from "@/aurelius/intelligence/StrategicPatternEngine";
import {
  runOutputContractGuard,
  getStabilityLogFilePath,
  type StabilityWarning,
} from "@/aurelius/stability/OutputContractGuard";
import { runEngineContractGuard } from "@/aurelius/stability/EngineContractGuard";
import { runPromptConsistencyGuard } from "@/aurelius/stability/PromptConsistencyGuard";
import { EngineExecutionGuard } from "@/aurelius/stability/EngineExecutionGuard";
import { runNarrativeStructureGuard } from "@/aurelius/stability/NarrativeStructureGuard";
import { enforceBoardNarrativeStructure } from "@/aurelius/narrative/NarrativeStructureGuard";
import { formatBoardNarrative } from "@/aurelius/narrative/BoardNarrativeFormatter";
import { SectorIntelligenceEngine } from "@/aurelius/os/SectorIntelligenceEngine";
import { StrategicModelEngine } from "@/aurelius/os/StrategicModelEngine";
import { InterventionOutcomeEngine } from "@/aurelius/os/InterventionOutcomeEngine";
import { StrategicKnowledgeGraph } from "@/aurelius/os/StrategicKnowledgeGraph";
import { OrganizationPortfolioAnalyzer } from "@/aurelius/os/OrganizationPortfolioAnalyzer";
import { StrategicDatasetManager } from "@/aurelius/data/StrategicDatasetManager";
import { buildStrategicAnalysisMap } from "@/aurelius/analysis/buildStrategicAnalysisMap";
import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

export type StrategicContextState = {
  sector: string;
  organisatiegrootte: string;
  verdienmodel: string;
  kostenstructuur: string;
  marktcontext: string;
  governancecontext: string;
};

export type CyntraStrategicAgentInput = {
  context: AnalysisContext;
  boardroomInput?: Partial<BoardroomInput>;
  narrativeMode?: "deterministic" | "llm";
};

export type CyntraStrategicAgentOutput = {
  context_state: StrategicContextState;
  diagnosis: StrategicDiagnosisState;
  contradiction: {
    contradictions: string[];
    summary: string;
  };
  mechanisms: StrategicMechanismRecord[];
  insights: StrategicInsightRecord[];
  decision: StrategicDecisionRecord;
  intelligence: {
    similar_cases: RetrievedStrategicCase[];
    historical_patterns: StrategicPattern[];
  };
  strategic_os: {
    sector_patterns: Array<{
      pattern: string;
      evidence: string;
      strategic_implication: string;
    }>;
    strategic_model: {
      strategic_model: string;
      model_rationale: string;
    };
    intervention_success_patterns: Array<{
      interventie: string;
      sector: string;
      effect: string;
      confidence: "laag" | "middel" | "hoog";
    }>;
    portfolio_patterns: Array<{
      sector: string;
      ratio: string;
      pattern: string;
    }>;
    knowledge_graph: {
      nodes: Array<{ id: string; type: string; label: string }>;
      edges: Array<{ from: string; to: string; type: string }>;
    };
  };
  strategic_dataset: {
    similar_cases: Array<{
      case_id: string;
      sector: string;
      dominant_problem: string;
      gekozen_strategie: string;
      resultaat?: string;
    }>;
    intervention_success_patterns: Array<{
      sector: string;
      interventie: string;
      resultaat: string;
      confidence: "laag" | "middel" | "hoog";
    }>;
  };
  analysis_map: StrategicAnalysisMap;
  leverage_points: string[];
  simulation_results: {
    scenario_A: unknown;
    scenario_B: unknown;
    scenario_C: unknown;
  };
  stability: {
    warnings: StabilityWarning[];
    log_file: string;
    executed_layers: string[];
  };
  narrative: {
    mode: "deterministic" | "llm";
    boardroom_narrative: string;
    boardroom_brief: ReturnType<typeof buildBoardroomBrief>;
    board_memo: string;
    board_summary_slide: string;
    ceo_speech_2min: string;
  };
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sourceFromContext(context: AnalysisContext): string {
  return [context.rawText, ...(context.documents ?? []), ...(context.historicalContext ?? [])]
    .filter(Boolean)
    .join("\n");
}

function findOrganisationSize(source: string): string {
  const paxMatch = source.match(/\b(\d{1,4})\s*(?:pax|fte|medewerkers?)\b/i);
  if (paxMatch?.[1]) return `${paxMatch[1]} medewerkers/FTE indicatie`;
  if (/scale[- ]?up|groei|uitbreiding/i.test(source)) return "Groeiende organisatie (exacte omvang niet volledig onderbouwd)";
  return "Omvang niet expliciet gekwantificeerd";
}

function inferBusinessModel(source: string): string {
  const low = source.toLowerCase();
  if (/(verzekeraar|declaratie|zorgcode|contractplafond|bijbetalen)/.test(low)) {
    return "Declaratiegedreven zorgmodel met verzekeraarsafhankelijkheid";
  }
  if (/(abonnement|subscription|retainer|licentie)/.test(low)) {
    return "Terugkerend abonnements-/retainermodel";
  }
  if (/(project|advies|consultancy|uur)/.test(low)) {
    return "Project- en urenmodel met variabele bezetting";
  }
  return "Verdienmodel deels ongespecificeerd; afhankelijk van contextinput";
}

function buildContextLayer(context: AnalysisContext): StrategicContextState {
  const source = sourceFromContext(context);
  const lower = source.toLowerCase();

  const sectorFromUserContext = String(
    (context.userContext as Record<string, unknown> | undefined)?.sector ?? ""
  ).trim();
  const sector =
    sectorFromUserContext ||
    (/\bggz|zorg|jeugdzorg|wachtlijst\b/i.test(lower)
      ? "Zorg/GGZ"
      : "Sector niet expliciet benoemd");

  const kostenstructuur = /(loonkosten|tariefdruk|kostprijs|marge|liquiditeit|huur|overhead)/.test(lower)
    ? "Kostenstructuur onder druk door loon- en kostprijsstijging versus beperkte prijsruimte"
    : "Kostenstructuur niet volledig uitgewerkt in broncontext";

  const marktcontext = /(contract|verzekeraar|plafond|doorverwijzing|marktdruk|concurrentie)/.test(lower)
    ? "Marktcontext wordt begrensd door contractvoorwaarden, plafonds en verwijzersdynamiek"
    : "Marktcontext gedeeltelijk beschreven; externe beperkingen niet volledig gekwantificeerd";

  const governancecontext = /(mandaat|governance|escalatie|bestuur|rvt|mt|onderstroom|besluit)/.test(lower)
    ? "Governancecontext toont spanning tussen strategische ambitie en besluitritme"
    : "Governancecontext beperkt expliciet; risico op impliciete besluitvorming";

  return {
    sector,
    organisatiegrootte: findOrganisationSize(source),
    verdienmodel: inferBusinessModel(source),
    kostenstructuur,
    marktcontext,
    governancecontext,
  };
}

function buildDiagnosisLayer(contextState: StrategicContextState, source: string): StrategicDiagnosisState {
  const lower = source.toLowerCase();

  const dominantProblem = /(parallel|tegelijk|verbred|consolid|prioriter)/.test(lower)
    ? "Parallelle ambities zonder harde volgorde versnellen financiële en operationele druk"
    : "Besluitvolgorde en sturingsdiscipline zijn onvoldoende expliciet onder druk";

  const financialPressure = /(tarief|kostprijs|marge|loonkosten|liquiditeit|plafond|contract)/.test(lower)
    ? "Structurele margedruk door stijgende kosten en begrensde opbrengstruimte"
    : "Financiële druk aanwezig, maar doorrekening op productniveau deels ontbrekend";

  const organizationalConstraints = /(capaciteit|planning|productiviteit|team|werkdruk|intake|no-show)/.test(lower)
    ? "Capaciteit, planning en normdruk begrenzen gelijktijdige executie"
    : "Operationele constraints zijn vermoedelijk relevant maar onvoldoende hard gekwantificeerd";

  const marketConstraints = /(verzekeraar|contract|plafond|doorverwijzing|bijbetalen|tarief)/.test(lower)
    ? "Externe contract- en marktvoorwaarden limiteren autonome groei"
    : "Marktbeperkingen zijn deels impliciet en vragen expliciete validatie";

  const governanceConstraints = /(mandaat|escalatie|besluit|rvt|mt|onderstroom|vermijding)/.test(lower)
    ? "Mandaat, escalatie en besluitritme zijn niet overal hard verankerd"
    : "Governancebeperkingen zijn waarschijnlijk, maar nog niet uniform geformaliseerd";

  return {
    dominant_problem: dominantProblem,
    financial_pressure: financialPressure,
    organizational_constraints: organizationalConstraints,
    market_constraints: marketConstraints,
    governance_constraints: governanceConstraints,
  };
}

function runContradictionEngine(
  diagnosis: StrategicDiagnosisState,
  source: string
): {
  contradictions: string[];
  summary: string;
} {
  const contradictions: string[] = [];
  const diagnosisSource = [
    diagnosis.dominant_problem,
    diagnosis.financial_pressure,
    diagnosis.organizational_constraints,
    diagnosis.market_constraints,
    diagnosis.governance_constraints,
  ]
    .join(" ")
    .toLowerCase();
  const raw = String(source ?? "").toLowerCase();

  if (/parallel|tegelijk/.test(diagnosisSource) && /focus|consolider|stabil/.test(raw)) {
    contradictions.push(
      "Parallelle sturing en focus op consolidatie zijn gelijktijdig aanwezig en vragen expliciete volgorde."
    );
  }
  if (/contract|plafond|limiteren/.test(diagnosisSource) && /snelle groei|versneld/.test(raw)) {
    contradictions.push(
      "Externe contractbeperkingen botsen met impliciete groeiverwachtingen."
    );
  }

  if (!contradictions.length) {
    contradictions.push("Geen kritieke contradicties gedetecteerd boven ingestelde drempel.");
  }

  return {
    contradictions,
    summary: contradictions[0] ?? "Contradiction Engine uitgevoerd zonder harde inconsistenties.",
  };
}

function runStrategicLeverageEngine(
  mechanisms: StrategicMechanismRecord[],
  insights: StrategicInsightRecord[],
  patterns: StrategicPattern[]
): string[] {
  const leverage = new Set<string>();

  for (const mechanism of mechanisms) {
    if (mechanism.leverage_point) leverage.add(mechanism.leverage_point);
  }
  for (const insight of insights) {
    if (insight.recommended_focus) leverage.add(insight.recommended_focus);
  }
  for (const pattern of patterns) {
    if (pattern.strategic_implication) leverage.add(pattern.strategic_implication);
  }

  const values = Array.from(leverage).filter(Boolean);
  if (values.length >= 3) return values.slice(0, 8);
  return [
    "Contractdiscipline en margevloer per verzekeraar",
    "Centrale prioritering met expliciete stop-doing keuzes",
    "Escalatieritme op 30/60/90 dagen met bindend mandaat",
  ];
}

function formatMechanismLayer(mechanisms: StrategicMechanismRecord[]): string {
  return mechanisms
    .map((item, index) => {
      const n = index + 1;
      return [
        `${n}. symptom: ${item.symptom}`,
        `   mechanism: ${item.mechanism}`,
        `   root_cause: ${item.root_cause}`,
        `   leverage_point: ${item.leverage_point}`,
      ].join("\n");
    })
    .join("\n");
}

function formatInsightLayer(insights: StrategicInsightRecord[]): string {
  return insights
    .map((item, index) => {
      const n = index + 1;
      return [
        `${n}. strategic_pattern: ${item.strategic_pattern}`,
        `   implication: ${item.implication}`,
        `   recommended_focus: ${item.recommended_focus}`,
      ].join("\n");
    })
    .join("\n");
}

function formatDecisionLayer(decision: StrategicDecisionRecord): string {
  const optionBlock = decision.strategic_options
    .map((option) => {
      return [
        `OPTIE ${option.code}`,
        `description: ${option.description}`,
        `financial_effect: ${option.financial_effect}`,
        `operational_effect: ${option.operational_effect}`,
        `risk_profile: ${option.risk_profile}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `dominant_thesis: ${decision.dominant_thesis}`,
    optionBlock,
    `recommended_option: ${decision.recommended_option}`,
    `tradeoffs: ${decision.tradeoffs.join(" | ")}`,
    `price_of_delay_30: ${decision.price_of_delay.days_30}`,
    `price_of_delay_90: ${decision.price_of_delay.days_90}`,
    `price_of_delay_365: ${decision.price_of_delay.days_365}`,
  ].join("\n");
}

function buildContextDocument(
  contextState: StrategicContextState,
  diagnosis: StrategicDiagnosisState,
  mechanisms: StrategicMechanismRecord[],
  insights: StrategicInsightRecord[],
  decision: StrategicDecisionRecord,
  sectorIntelligenceSection: string,
  historicalCasesSection: string,
  historicalPatternAnalysis: string,
  simulationSummary: string
): string {
  return [
    "CONTEXT LAYER",
    `sector: ${contextState.sector}`,
    `organisatiegrootte: ${contextState.organisatiegrootte}`,
    `verdienmodel: ${contextState.verdienmodel}`,
    `kostenstructuur: ${contextState.kostenstructuur}`,
    `marktcontext: ${contextState.marktcontext}`,
    `governancecontext: ${contextState.governancecontext}`,
    "",
    "DIAGNOSIS LAYER",
    `dominant_problem: ${diagnosis.dominant_problem}`,
    `financial_pressure: ${diagnosis.financial_pressure}`,
    `organizational_constraints: ${diagnosis.organizational_constraints}`,
    `market_constraints: ${diagnosis.market_constraints}`,
    `governance_constraints: ${diagnosis.governance_constraints}`,
    "",
    "MECHANISM LAYER",
    formatMechanismLayer(mechanisms),
    "",
    "STRATEGIC INSIGHT LAYER",
    formatInsightLayer(insights),
    "",
    "DECISION LAYER",
    formatDecisionLayer(decision),
    "",
    sectorIntelligenceSection,
    "",
    historicalCasesSection,
    "",
    simulationSummary,
    "",
    historicalPatternAnalysis,
    "",
    "NARRATIVE KETEN: CONTEXT -> KERNCONFLICT -> MECHANISME -> BESTUURLIJKE IMPLICATIE -> BESLUIT",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function formatSimulationSummary(simulation: {
  scenario_A: {
    financial_impact: { marge_delta: string };
    capacity_impact: { fte_change: string };
    execution_risk: { level: string };
  };
  scenario_B: {
    financial_impact: { marge_delta: string };
    capacity_impact: { fte_change: string };
    execution_risk: { level: string };
  };
  scenario_C: {
    financial_impact: { marge_delta: string };
    capacity_impact: { fte_change: string };
    execution_risk: { level: string };
  };
}): string {
  return [
    "### STRATEGISCHE SCENARIOSIMULATIE",
    `Optie A | financieel effect: ${simulation.scenario_A.financial_impact.marge_delta} | capaciteit: ${simulation.scenario_A.capacity_impact.fte_change} | risico: ${simulation.scenario_A.execution_risk.level}`,
    `Optie B | financieel effect: ${simulation.scenario_B.financial_impact.marge_delta} | capaciteit: ${simulation.scenario_B.capacity_impact.fte_change} | risico: ${simulation.scenario_B.execution_risk.level}`,
    `Optie C | financieel effect: ${simulation.scenario_C.financial_impact.marge_delta} | capaciteit: ${simulation.scenario_C.capacity_impact.fte_change} | risico: ${simulation.scenario_C.execution_risk.level}`,
  ].join("\n");
}

function formatSectorIntelligenceSection(input: {
  sector_patterns: Array<{
    pattern: string;
    evidence: string;
    strategic_implication: string;
  }>;
  strategic_model: {
    strategic_model: string;
    model_rationale: string;
  };
  intervention_success_patterns: Array<{
    interventie: string;
    sector: string;
    effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
}): string {
  const patterns = input.sector_patterns
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.pattern} | ${item.strategic_implication}`)
    .join("\n");
  const outcomes = input.intervention_success_patterns
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. interventie: ${item.interventie} | effect: ${item.effect} | confidence: ${item.confidence}`
    )
    .join("\n");

  return [
    "### SECTORINTELLIGENTIE",
    "Sectorpatronen",
    patterns || "Geen sterke sectorpatronen gedetecteerd in huidige case set.",
    "",
    "Strategisch model van organisatie",
    `${input.strategic_model.strategic_model} | ${input.strategic_model.model_rationale}`,
    "",
    "Historische interventieresultaten",
    outcomes || "Nog onvoldoende historische interventie-uitkomsten voor robuuste inferentie.",
  ].join("\n");
}

function formatHistoricalCasesSection(input: {
  similar_cases: Array<{
    case_id: string;
    sector: string;
    dominant_problem: string;
    gekozen_strategie: string;
    resultaat?: string;
  }>;
  intervention_success_patterns: Array<{
    sector: string;
    interventie: string;
    resultaat: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
}): string {
  const caseLines = input.similar_cases.length
    ? input.similar_cases
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. ${item.case_id} | probleem: ${item.dominant_problem} | strategie: ${item.gekozen_strategie} | resultaat: ${item.resultaat ?? "nog niet beschikbaar"}`
        )
        .join("\n")
    : "Geen vergelijkbare organisaties beschikbaar in strategische dataset.";

  const interventionLines = input.intervention_success_patterns.length
    ? input.intervention_success_patterns
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. interventie: ${item.interventie} | resultaat: ${item.resultaat} | confidence: ${item.confidence}`
        )
        .join("\n")
    : "Nog geen interventieresultaten beschikbaar voor robuuste historische vergelijking.";

  return [
    "### HISTORISCHE CASES",
    "Vergelijkbare organisaties",
    caseLines,
    "",
    "Gekozen strategieën",
    input.similar_cases.length
      ? input.similar_cases
          .slice(0, 5)
          .map((item, index) => `${index + 1}. ${item.gekozen_strategie}`)
          .join("\n")
      : "Geen historisch strategiepatroon beschikbaar.",
    "",
    "Interventieresultaten",
    interventionLines,
  ].join("\n");
}

function buildCaseRecord(
  contextState: StrategicContextState,
  diagnosis: StrategicDiagnosisState,
  mechanisms: StrategicMechanismRecord[],
  decision: StrategicDecisionRecord,
  contextDocument: string
): StrategicCase {
  const now = new Date().toISOString();
  const caseId = `strategic-case-${Math.abs(
    Array.from(`${now}-${diagnosis.dominant_problem}`).reduce(
      (hash, char) => (hash * 31 + char.charCodeAt(0)) | 0,
      7
    )
  )}`;

  return {
    case_id: caseId,
    created_at: now,
    organisatie_type: contextState.verdienmodel,
    sector: contextState.sector,
    organisatiegrootte: contextState.organisatiegrootte,
    dominant_problem: diagnosis.dominant_problem,
    dominant_thesis: decision.dominant_thesis,
    mechanisms: mechanisms.map((item) => `${item.symptom} | ${item.mechanism} | ${item.root_cause}`),
    strategic_options: decision.strategic_options.map((item) => `${item.code}: ${item.description}`),
    gekozen_strategie: `Optie ${decision.recommended_option}`,
    interventieprogramma: contextDocument.slice(0, 4000),
    resultaat: undefined,
  };
}

function buildBoardroomInput(
  input: CyntraStrategicAgentInput,
  contextState: StrategicContextState,
  diagnosis: StrategicDiagnosisState,
  decision: StrategicDecisionRecord,
  contextDocument: string
): BoardroomInput {
  const source = sourceFromContext(input.context);
  const contextNarrative = [contextDocument, source].filter(Boolean).join("\n\n");

  return {
    company_name: input.context.companyName ?? "Onbekende organisatie",
    company_context: contextNarrative,
    executive_thesis: decision.dominant_thesis,
    central_tension: diagnosis.dominant_problem,
    strategic_narrative: contextDocument,
    governance_risks: [diagnosis.governance_constraints],
    execution_risks: [diagnosis.organizational_constraints],
    ...input.boardroomInput,
  };
}

function extractArtifact(text: string, marker: "OUTPUT 1" | "OUTPUT 2" | "OUTPUT 3"): string {
  const source = String(text ?? "");
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}[\\s\\S]*?(?=\\nOUTPUT [123]\\b|$)`, "i");
  const match = source.match(regex);
  return normalize(match?.[0] ?? "");
}

function ensureSimulationInBoardMemo(
  boardMemo: string,
  simulation: {
    scenario_A: {
      financial_impact: { marge_delta: string };
      capacity_impact: { fte_change: string };
      execution_risk: { level: string };
    };
    scenario_B: {
      financial_impact: { marge_delta: string };
      capacity_impact: { fte_change: string };
      execution_risk: { level: string };
    };
    scenario_C: {
      financial_impact: { marge_delta: string };
      capacity_impact: { fte_change: string };
      execution_risk: { level: string };
    };
  }
): string {
  const source = String(boardMemo ?? "").trim();
  if (
    /Optie A - Simulatie:/i.test(source) &&
    /Optie B - Simulatie:/i.test(source) &&
    /Optie C - Simulatie:/i.test(source)
  ) {
    return source;
  }

  const simulationBlock = [
    "",
    "Simulatieresultaten per optie",
    `- Optie A - Simulatie: marge ${simulation.scenario_A.financial_impact.marge_delta}; capaciteit ${simulation.scenario_A.capacity_impact.fte_change}; risico ${simulation.scenario_A.execution_risk.level}.`,
    `- Optie B - Simulatie: marge ${simulation.scenario_B.financial_impact.marge_delta}; capaciteit ${simulation.scenario_B.capacity_impact.fte_change}; risico ${simulation.scenario_B.execution_risk.level}.`,
    `- Optie C - Simulatie: marge ${simulation.scenario_C.financial_impact.marge_delta}; capaciteit ${simulation.scenario_C.capacity_impact.fte_change}; risico ${simulation.scenario_C.execution_risk.level}.`,
  ].join("\n");

  return `${source}\n${simulationBlock}`.trim();
}

export async function runCyntraStrategicAgent(
  input: CyntraStrategicAgentInput
): Promise<CyntraStrategicAgentOutput> {
  const narrativeMode = input.narrativeMode ?? "deterministic";
  const source = sourceFromContext(input.context);
  const stabilityWarnings: StabilityWarning[] = [];
  const executionGuard = new EngineExecutionGuard();

  const context_state = buildContextLayer(input.context);
  executionGuard.record("Context Layer");
  stabilityWarnings.push(
    ...runOutputContractGuard("Context Layer", { context_state }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("ContextContract", { context_state }).warnings
  );

  const diagnosis = buildDiagnosisLayer(context_state, source);
  executionGuard.record("Diagnosis Layer");
  stabilityWarnings.push(
    ...runOutputContractGuard("Diagnosis Layer", { diagnosis }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("DiagnosisContract", { diagnosis }).warnings
  );

  const contradiction = runContradictionEngine(diagnosis, source);
  executionGuard.record("Contradiction Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Contradiction Engine", { contradiction }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("ContradictionContract", {
      contradictions: contradiction,
    }).warnings
  );

  const mechanismLayer = new StrategicMechanismLayer();
  const mechanisms = mechanismLayer.run({
    contextText: source,
    diagnosis,
  });
  executionGuard.record("Mechanism Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Mechanism Engine", { mechanisms }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("MechanismContract", { mechanisms }).warnings
  );

  const insightLayer = new StrategicInsightLayer();
  const insights = insightLayer.run({
    mechanisms,
    diagnosis,
  });
  executionGuard.record("Strategic Insight Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Strategic Insight Engine", {
      strategic_insights: insights,
    }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("InsightContract", { insights }).warnings
  );

  const decisionLayer = new StrategicDecisionLayer();
  const baseDecision = decisionLayer.run({
    contextText: source,
    diagnosis,
    mechanisms,
    insights,
  });

  const memoryStore = new StrategicMemoryStore();
  const memoryRetriever = new StrategicMemoryRetriever(memoryStore);
  const patternEngine = new StrategicPatternEngine();
  const datasetManager = new StrategicDatasetManager();

  const similar_cases = memoryRetriever.retrieveSimilarCases({
    probleemtype: diagnosis.dominant_problem,
    sector: context_state.sector,
    strategische_inzichten: insights.map((item) => item.strategic_pattern),
    mechanismen: mechanisms.map((item) => item.mechanism),
    top_k: 5,
  });
  const datasetSimilarCases = datasetManager.findSimilarCases({
    sector: context_state.sector,
    dominant_problem: diagnosis.dominant_problem,
    topK: 5,
  });
  const historical_patterns = patternEngine.detectPatterns({ similar_cases });
  executionGuard.record("Strategic Pattern Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Strategic Pattern Engine", {
      historical_patterns,
    }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("PatternContract", {
      patterns: historical_patterns,
    }).warnings
  );

  const leverage_points = runStrategicLeverageEngine(
    mechanisms,
    insights,
    historical_patterns
  );
  executionGuard.record("Strategic Leverage Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Strategic Leverage Engine", {
      leverage_points,
    }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("LeverageContract", { leverage_points }).warnings
  );

  const simulationEngine = new StrategicSimulationEngine();
  const simulationEnvelope = simulationEngine.run({
    context_state,
    diagnosis,
    mechanisms,
    strategic_insights: insights,
    decision_options: baseDecision.strategic_options,
    historical_patterns,
    historical_cases_count: similar_cases.length,
  });
  const simulation_results = simulationEnvelope.simulation;
  executionGuard.record("Strategic Simulation Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Strategic Simulation Engine", {
      simulation_results,
    }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("SimulationContract", {
      simulation: simulation_results,
    }).warnings
  );

  const decision = attachSimulationAndPatterns(
    baseDecision,
    simulation_results,
    historical_patterns
  );
  executionGuard.record("Decision Engine");
  stabilityWarnings.push(
    ...runOutputContractGuard("Decision Engine", { decision }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("DecisionContract", { decision }).warnings
  );

  const sectorIntelligenceEngine = new SectorIntelligenceEngine();
  const strategicModelEngine = new StrategicModelEngine();
  const interventionOutcomeEngine = new InterventionOutcomeEngine();
  const strategicKnowledgeGraph = new StrategicKnowledgeGraph();
  const portfolioAnalyzer = new OrganizationPortfolioAnalyzer();

  const sectorIntelligence = sectorIntelligenceEngine.analyze({
    sector: context_state.sector,
    contextText: source,
    mechanisms: mechanisms.map((item) => item.mechanism),
    insights: insights.map((item) => item.strategic_pattern),
  });
  const strategicModel = strategicModelEngine.identify({
    sector: context_state.sector,
    verdienmodel: context_state.verdienmodel,
    contextText: source,
  });
  const interventionOutcomes = interventionOutcomeEngine.analyze({
    sector: context_state.sector,
    historical_cases: similar_cases.map((item) => ({
      case_id: item.case.case_id,
      sector: item.case.sector,
      gekozen_strategie: item.case.gekozen_strategie,
      interventieprogramma: item.case.interventieprogramma,
      resultaat: item.case.resultaat,
    })),
  });
  const portfolioAnalysis = portfolioAnalyzer.analyze({
    cases: memoryStore.listCases().map((item) => ({
      case_id: item.case_id,
      sector: item.sector,
      dominant_problem: item.dominant_problem,
      gekozen_strategie: item.gekozen_strategie,
      resultaat: item.resultaat,
    })),
  });
  const knowledgeGraph = strategicKnowledgeGraph.build({
    sector: context_state.sector,
    dominant_problem: diagnosis.dominant_problem,
    mechanisms: mechanisms.map((item) => item.mechanism),
    interventions: interventionOutcomes.intervention_success_patterns.map(
      (item) => item.interventie
    ),
    outcomes: interventionOutcomes.intervention_success_patterns.map(
      (item) => item.effect
    ),
  });
  const strategic_os = {
    sector_patterns: sectorIntelligence.sector_patterns,
    strategic_model: strategicModel,
    intervention_success_patterns: interventionOutcomes.intervention_success_patterns,
    portfolio_patterns: portfolioAnalysis.portfolio_patterns,
    knowledge_graph: knowledgeGraph,
  };

  const datasetLearning = datasetManager.summaryForSector(context_state.sector);
  const strategic_dataset = {
    similar_cases: datasetSimilarCases.map((item) => ({
      case_id: item.case_id,
      sector: item.sector,
      dominant_problem: item.dominant_problem,
      gekozen_strategie: item.gekozen_strategie,
      resultaat: item.resultaat,
    })),
    intervention_success_patterns: datasetLearning.intervention_success_patterns,
  };
  executionGuard.record("Strategic OS Layer");
  stabilityWarnings.push(
    ...runOutputContractGuard("Strategic OS Layer", { strategic_os }).warnings
  );

  const historicalPatternAnalysis = patternEngine.renderHistoricalPatternAnalysis(
    similar_cases,
    historical_patterns
  );
  const sectorIntelligenceSection = formatSectorIntelligenceSection({
    sector_patterns: strategic_os.sector_patterns,
    strategic_model: strategic_os.strategic_model,
    intervention_success_patterns: strategic_os.intervention_success_patterns,
  });
  const historicalCasesSection = formatHistoricalCasesSection(strategic_dataset);
  const simulationSummary = formatSimulationSummary(simulation_results);

  const contextDocument = buildContextDocument(
    context_state,
    diagnosis,
    mechanisms,
    insights,
    decision,
    sectorIntelligenceSection,
    historicalCasesSection,
    historicalPatternAnalysis,
    simulationSummary
  );

  const boardroomInput = buildBoardroomInput(
    input,
    context_state,
    diagnosis,
    decision,
    contextDocument
  );
  const analysis_map = buildStrategicAnalysisMap({
    organisation:
      input.boardroomInput?.company_name ||
      String((input.context.userContext as Record<string, unknown> | undefined)?.organisation ?? ""),
    sector: context_state.sector,
    dominantRisk: diagnosis.dominant_problem,
    strategicOptions: decision.strategic_options.map((item) => item.description),
    recommendedOption:
      decision.strategic_options.find((item) => item.code === decision.recommended_option)?.description ||
      decision.recommended_option,
  });
  boardroomInput.analysis_map = analysis_map;

  const boardroom_narrative =
    narrativeMode === "llm"
      ? await generateBoardroomNarrative(boardroomInput, {
          minWords: 3500,
          maxWords: 6200,
          temperature: 0.18,
        })
      : contextDocument;

  const syntheticResult: RunCyntraResult = {
    report: decision.dominant_thesis,
    confidence: "high",
  };

  const boardroom_brief = buildBoardroomBrief(syntheticResult, boardroom_narrative);
  const narrativeText = boardroom_brief.strategic_narrative;
  executionGuard.record("Narrative Layer");
  stabilityWarnings.push(
    ...runOutputContractGuard("Narrative Layer", { board_report: narrativeText }).warnings
  );
  stabilityWarnings.push(
    ...runEngineContractGuard("NarrativeContract", {
      board_report: narrativeText,
    }).warnings
  );
  stabilityWarnings.push(
    ...runPromptConsistencyGuard({
      layer: "Narrative Layer",
      text: narrativeText,
      requiredSections: [
        "1. Besluitvraag",
        "2. Executive Thesis",
        "3. Feitenbasis",
        "4. Strategische opties",
        "5. Aanbevolen keuze",
      ],
      maxLength: 120000,
    }).warnings
  );

  const board_memo = extractArtifact(narrativeText, "OUTPUT 1");
  const board_summary_slide = extractArtifact(narrativeText, "OUTPUT 2");
  const ceo_speech_2min = extractArtifact(narrativeText, "OUTPUT 3");
  const formattedMemo = formatBoardNarrative(board_memo);
  const normalizedMemo = enforceBoardNarrativeStructure(formattedMemo);
  stabilityWarnings.push(...normalizedMemo.warnings);
  const guardedMemo = runNarrativeStructureGuard(normalizedMemo.text);
  const simulationEnforcedMemo = ensureSimulationInBoardMemo(
    guardedMemo.board_memo,
    simulation_results
  );
  stabilityWarnings.push(...guardedMemo.warnings);

  const caseRecord = buildCaseRecord(
    context_state,
    diagnosis,
    mechanisms,
    decision,
    contextDocument
  );
  datasetManager.ingestAnalysis({
    case_record: {
      case_id: caseRecord.case_id,
      organisatie_type: caseRecord.organisatie_type,
      sector: caseRecord.sector,
      organisatie_grootte: caseRecord.organisatiegrootte,
      verdienmodel: context_state.verdienmodel,
      dominant_problem: caseRecord.dominant_problem,
      dominant_thesis: caseRecord.dominant_thesis,
      mechanisms: caseRecord.mechanisms,
      strategic_options: caseRecord.strategic_options,
      gekozen_strategie: caseRecord.gekozen_strategie,
      interventieprogramma: caseRecord.interventieprogramma,
      analyse_datum: caseRecord.created_at.slice(0, 10),
    },
  });
  memoryStore.upsertCase(caseRecord);
  memoryStore.upsertEmbedding(memoryRetriever.buildCaseEmbedding(caseRecord));

  return {
    context_state,
    diagnosis,
    contradiction,
    mechanisms,
    insights,
    decision,
    intelligence: {
      similar_cases,
      historical_patterns,
    },
    strategic_dataset,
    strategic_os,
    analysis_map,
    leverage_points,
    simulation_results,
    stability: {
      warnings: [...stabilityWarnings, ...executionGuard.snapshot().warnings],
      log_file: getStabilityLogFilePath(),
      executed_layers: executionGuard.snapshot().executed_layers,
    },
    narrative: {
      mode: narrativeMode,
      boardroom_narrative,
      boardroom_brief,
      board_memo: simulationEnforcedMemo,
      board_summary_slide,
      ceo_speech_2min,
    },
  };
}
