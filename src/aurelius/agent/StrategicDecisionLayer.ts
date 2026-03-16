import {
  DecisionPressureEngine,
  type StrategicDecisionOutput,
} from "@/aurelius/engine/nodes/strategy/DecisionPressureEngine";
import type { StrategicDiagnosisState, StrategicMechanismRecord } from "./StrategicMechanismLayer";
import type { StrategicInsightRecord } from "./StrategicInsightLayer";

export type StrategicDecisionOptionRecord = {
  code: "A" | "B" | "C";
  description: string;
  financial_effect: string;
  operational_effect: string;
  risk_profile: "Laag" | "Middel" | "Hoog" | "Laag-Middel";
};

export type StrategicDecisionRecord = {
  dominant_thesis: string;
  strategic_options: StrategicDecisionOptionRecord[];
  simulation_results?: {
    scenario_A: unknown;
    scenario_B: unknown;
    scenario_C: unknown;
  };
  historical_patterns?: Array<{
    pattern_description: string;
    cases_where_seen: string[];
    strategic_implication: string;
  }>;
  recommended_option: "A" | "B" | "C";
  tradeoffs: string[];
  price_of_delay: {
    days_30: string;
    days_90: string;
    days_365: string;
  };
};

export type StrategicDecisionLayerInput = {
  contextText: string;
  diagnosis: StrategicDiagnosisState;
  mechanisms: StrategicMechanismRecord[];
  insights: StrategicInsightRecord[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function mapRiskProfile(code: "A" | "B" | "C"): StrategicDecisionOptionRecord["risk_profile"] {
  if (code === "A") return "Laag-Middel";
  if (code === "B") return "Hoog";
  return "Middel";
}

function createOptionFromEngine(
  raw: StrategicDecisionOutput,
  code: "A" | "B" | "C"
): StrategicDecisionOptionRecord {
  const option = raw.strategic_options.find((item) => item.code === code);
  const tradeoff = raw.explicit_tradeoffs.find((item) => item.option.code === code);

  const description = option
    ? `${option.name}: ${option.strategicDirection}`
    : code === "A"
      ? "Consolidatie kernactiviteiten"
      : code === "B"
        ? "Verbreding nieuwe diensten"
        : "Kostenreductie en herstructurering";

  const financialEffect = tradeoff?.impactFinancials
    ? tradeoff.impactFinancials
    : code === "A"
      ? "Sneller margeherstel en lagere cash-volatiliteit"
      : code === "B"
        ? "Hoger opwaarts potentieel met groter neerwaarts risico"
        : "Directe kostenverlaging met transitiekosten";

  const operationalEffect = tradeoff?.impactOrganisation
    ? tradeoff.impactOrganisation
    : code === "A"
      ? "Meer focus en minder coördinatiedruk"
      : code === "B"
        ? "Hogere complexiteit en managementbelasting"
        : "Hoge veranderintensiteit met duidelijke besluitdiscipline";

  return {
    code,
    description: normalize(description),
    financial_effect: normalize(financialEffect),
    operational_effect: normalize(operationalEffect),
    risk_profile: mapRiskProfile(code),
  };
}

export class StrategicDecisionLayer {
  readonly name = "Strategic Decision Layer";

  private readonly engine = new DecisionPressureEngine();

  run(input: StrategicDecisionLayerInput): StrategicDecisionRecord {
    const diagnosisText = [
      input.diagnosis.dominant_problem,
      input.diagnosis.financial_pressure,
      input.diagnosis.organizational_constraints,
      input.diagnosis.market_constraints,
      input.diagnosis.governance_constraints,
    ]
      .filter(Boolean)
      .join(" ");

    const decision = this.engine.analyze({
      contextText: input.contextText,
      diagnosisText,
      mechanisms: input.mechanisms.map((item) => ({
        symptom: item.symptom,
        mechanism: item.mechanism,
        structural_cause: item.root_cause,
        system_effect: item.leverage_point,
      })),
      insights: input.insights.map((item) => ({
        insight: item.strategic_pattern,
        implication: item.implication,
        strategic_lever: item.recommended_focus,
      })),
    });

    const options: StrategicDecisionOptionRecord[] = ["A", "B", "C"].map((code) =>
      createOptionFromEngine(decision, code)
    );

    const tradeoffs = decision.explicit_tradeoffs.map(
      (tradeoff) => `${tradeoff.option.code}: ${tradeoff.disadvantages}`
    );

    return {
      dominant_thesis: normalize(decision.dominant_thesis),
      strategic_options: options,
      recommended_option: decision.preferred_option,
      tradeoffs,
      price_of_delay: {
        days_30: normalize(decision.price_of_delay.days_30),
        days_90: normalize(decision.price_of_delay.days_90),
        days_365: normalize(decision.price_of_delay.days_365),
      },
    };
  }
}

export function attachSimulationAndPatterns(
  decision: StrategicDecisionRecord,
  simulationResults: {
    scenario_A: unknown;
    scenario_B: unknown;
    scenario_C: unknown;
  },
  historicalPatterns: Array<{
    pattern_description: string;
    cases_where_seen: string[];
    strategic_implication: string;
  }>
): StrategicDecisionRecord {
  return {
    ...decision,
    simulation_results: simulationResults,
    historical_patterns: historicalPatterns,
  };
}
