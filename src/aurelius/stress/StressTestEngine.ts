import type { LeverCombinationInsight } from "@/aurelius/strategy/LeverCombinationAnalyzer";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import type { CausalStrategyResult } from "@/aurelius/causal/CausalStrategyEngine";
import type { StrategyScenario } from "@/aurelius/simulation/ScenarioModel";
import { predictShockEffect } from "./ShockImpactPredictor";
import { deriveStressBoardImplication, deriveStressRisk } from "./StrategyResilienceModel";
import { STRESS_SCENARIOS, type StressScenario } from "./StressScenarioMatrix";

export type StrategicStressTest = {
  scenario: StressScenario;
  effect: string;
  strategic_risk: string;
  board_implication: string;
};

export type StressTestResult = {
  tests: StrategicStressTest[];
  block: string;
  memoSummary: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function runStressTestEngine(input: {
  strategic_options?: string[];
  strategic_hefbomen?: StrategicLeverInsight[];
  strategic_hefboom_combinatie?: LeverCombinationInsight | null;
  strategic_causal_analysis?: CausalStrategyResult | null;
  strategic_scenarios?: StrategyScenario[];
}): StressTestResult {
  const context = [
    ...(input.strategic_options || []),
    ...(input.strategic_hefbomen || []).map((item) => item.lever),
    input.strategic_hefboom_combinatie?.levers.join(" "),
    input.strategic_causal_analysis?.summary,
    ...(input.strategic_scenarios || []).map((item) => item.mechanism),
  ]
    .filter(Boolean)
    .join("\n");

  const tests = STRESS_SCENARIOS.map((scenario) => ({
    scenario,
    effect: predictShockEffect(scenario, context),
    strategic_risk: deriveStressRisk(scenario, input.strategic_hefbomen || []),
    board_implication: deriveStressBoardImplication(scenario),
  }));

  return {
    tests,
    block: [
      "### Strategische stresstest",
      ...tests.map((item) =>
        [
          `Stress test: ${item.scenario}`,
          "",
          "Effect",
          item.effect,
          "",
          "Strategisch risico",
          item.strategic_risk,
          "",
          "Bestuurlijke implicatie",
          item.board_implication,
        ].join("\n")
      ),
    ].join("\n\n"),
    memoSummary:
      tests[0]
        ? `Belangrijkste stresstest risico: ${normalize(tests[0].strategic_risk)}`
        : "Belangrijkste stresstest risico: niet beschikbaar.",
  };
}
