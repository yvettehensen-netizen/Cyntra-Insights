import type { LeverCombinationInsight } from "@/aurelius/strategy/LeverCombinationAnalyzer";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import type { CausalStrategyResult } from "@/aurelius/causal/CausalStrategyEngine";

export type ScenarioCode = "A" | "B" | "C";

export type StrategyScenario = {
  scenario: ScenarioCode;
  name: string;
  mechanism: string;
  operational_effect: string;
  financial_effect: string;
  strategic_risk: string;
  board_implication: string;
  risk_level: "laag" | "middel" | "hoog";
};

export type ScenarioEngineInput = {
  strategic_options?: string[];
  strategic_hefbomen?: StrategicLeverInsight[];
  strategic_hefboom_combinatie?: LeverCombinationInsight | null;
  strategic_causal_analysis?: CausalStrategyResult | null;
  strategic_scenarios?: StrategyScenario[];
};

export type ScenarioResult = {
  scenario: ScenarioCode;
  title: string;
  mechanism: string;
  operationalEffect: string;
  financialEffect: string;
  boardRisk: string;
  implication: string;
  riskLevel: "laag" | "middel" | "hoog";
};

export type ScenarioSimulationBlock = {
  title: string;
  body: string;
};
