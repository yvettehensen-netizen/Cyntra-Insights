import type {
  CaseDatasetRecord,
  InterventionDatasetRecord,
  StrategicDatasetRecord,
} from "@/aurelius/data";
import { BenchmarkEngine, StrategicSignalEngine } from "@/aurelius/network";
import { StrategicKnowledgeGraph } from "@/aurelius/knowledge";
import { StrategicPatternExtractor } from "@/aurelius/knowledge/StrategicPatternExtractor";
import { StrategicInsightGraphQuery } from "@/aurelius/knowledge/StrategicInsightGraphQuery";
import { StrategicMechanismEngine } from "@/aurelius/engine/nodes/strategy/StrategicMechanismEngine";
import { StrategicInsightEngine } from "@/aurelius/engine/nodes/strategy/StrategicInsightEngine";
import { DecisionPressureEngine } from "@/aurelius/engine/nodes/strategy/DecisionPressureEngine";
import type { InterpretedStrategyQuestion } from "./StrategyQuestionInterpreter";

export type StrategyRecommendation = {
  strategisch_advies: string;
  risico_analyse: string[];
  interventies: string[];
  confidence: number;
  benchmark_samenvatting: string;
  signaal_samenvatting: string;
  onderbouwing: string[];
};

export type StrategyRecommendationInput = {
  interpreted: InterpretedStrategyQuestion;
  organisatie?: string;
  records: StrategicDatasetRecord[];
  cases: CaseDatasetRecord[];
  interventions: InterventionDatasetRecord[];
  conversation_context?: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(3));
}

function mapSignalsToKnowledgeSignals(
  signals: ReturnType<StrategicSignalEngine["detect"]>,
  sector: string
) {
  return signals.map((item) => ({
    sector: sector || "Multi-sector",
    signaal: item.type,
    impact: item.implicatie,
    urgentie: item.severity,
  }));
}

export class StrategyRecommendationEngine {
  readonly name = "Strategy Recommendation Engine";

  private readonly mechanismEngine = new StrategicMechanismEngine();
  private readonly insightEngine = new StrategicInsightEngine();
  private readonly decisionEngine = new DecisionPressureEngine();
  private readonly benchmarkEngine = new BenchmarkEngine();
  private readonly signalEngine = new StrategicSignalEngine();
  private readonly knowledgeGraph = new StrategicKnowledgeGraph();
  private readonly patternExtractor = new StrategicPatternExtractor();
  private readonly graphQuery = new StrategicInsightGraphQuery();

  recommend(input: StrategyRecommendationInput): StrategyRecommendation {
    const sector = normalize(input.interpreted.sector) || "Alle sectoren";
    const scopedRecords = input.records.filter((row) => {
      if (!input.interpreted.sector) return true;
      return normalize(row.sector).toLowerCase() === normalize(input.interpreted.sector).toLowerCase();
    });

    const contextText = [
      `Vraag: ${input.interpreted.original_question}`,
      `Strategiefocus: ${input.interpreted.strategy}`,
      `Risicofocus: ${input.interpreted.risk_focus.join(", ")}`,
      `Tijdshorizon: ${input.interpreted.time_horizon}`,
      input.conversation_context ? `Context uit gesprek:\n${input.conversation_context}` : "",
      scopedRecords.slice(0, 6).map((r) => `${r.probleemtype} | ${r.mechanismen.join("; ")}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    const mechanisms = this.mechanismEngine.analyze({
      contextText,
      diagnosisText: `Sector: ${sector}`,
    });
    const insights = this.insightEngine.analyze({ mechanisms });
    const decision = this.decisionEngine.analyze({
      contextText,
      diagnosisText: `Organisatie: ${normalize(input.organisatie) || "onbekend"}`,
      mechanisms,
      insights,
    });

    const signals = this.signalEngine.detect(scopedRecords.length ? scopedRecords : input.records);
    const benchmark = this.benchmarkEngine.compare(input.records, input.interpreted.sector);

    this.knowledgeGraph.buildFromData({
      records: (scopedRecords.length ? scopedRecords : input.records).map((row, idx) => ({
        record_id: row.dataset_id || `record-${idx + 1}`,
        session_id: `copilot-${idx + 1}`,
        sector: row.sector,
        probleemtype: row.probleemtype,
        mechanismen: row.mechanismen || [],
        interventies: row.interventies || [],
        strategische_opties: [],
        gekozen_strategie: "onbekend",
        created_at: row.created_at,
      })),
      cases: input.cases,
      interventions: input.interventions,
      signals: mapSignalsToKnowledgeSignals(signals, sector),
    });

    const patterns = this.patternExtractor.extract(input.cases, input.interventions);
    const interventionHints = this.graphQuery
      .interventionForProblem(patterns, scopedRecords[0]?.probleemtype || input.interpreted.risk_focus[0] || "strategisch")
      .slice(0, 3)
      .map((p) => `${p.interventie} (succesratio ${Math.round(p.succesratio * 100)}%)`);

    const selectedOption = decision.strategic_options.find((o) => o.code === decision.preferred_option);

    const strategischAdvies = [
      decision.dominant_thesis,
      `Aanbevolen richting: optie ${decision.preferred_option}${selectedOption ? ` - ${selectedOption.name}` : ""}.`,
      `Bestuurlijke reden: ${decision.preferred_option_reason}`,
    ].join(" ");

    const risicoAnalyse = [
      decision.price_of_delay.days_30,
      decision.price_of_delay.days_90,
      decision.price_of_delay.days_365,
      ...signals.slice(0, 2).map((s) => `${s.type}: ${s.bewijs}`),
    ];

    const interventies = [
      ...interventionHints,
      ...decision.explicit_tradeoffs.slice(0, 2).map((tradeoff) => `Trade-off managen: ${tradeoff.choice_consequence}`),
    ].slice(0, 6);

    const benchmarkSamenvatting =
      `Benchmark ${benchmark.sector}: groei ${benchmark.gemiddelden.groei}, marge ${benchmark.gemiddelden.marge}, ` +
      `capaciteit ${benchmark.gemiddelden.capaciteit}, risico ${benchmark.gemiddelden.risico}. ${benchmark.strategische_duiding}`;

    const signaalSamenvatting = signals
      .slice(0, 3)
      .map((s) => `${s.type} (${s.severity})`)
      .join(", ");

    const confidence = clampConfidence((0.55 + decision.explicit_tradeoffs.length * 0.05 + signals.length * 0.03) / 1.2);

    return {
      strategisch_advies: strategischAdvies,
      risico_analyse: risicoAnalyse,
      interventies,
      confidence,
      benchmark_samenvatting: benchmarkSamenvatting,
      signaal_samenvatting: signaalSamenvatting || "Nog onvoldoende signalen in de dataset.",
      onderbouwing: insights.slice(0, 4).map((item) => `${item.insight} ${item.implication}`),
    };
  }
}
