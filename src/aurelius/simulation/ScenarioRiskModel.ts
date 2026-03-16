import type { ScenarioEngineInput, StrategyScenario } from "./ScenarioModel";

export function scoreScenarioRisk(
  scenario: StrategyScenario,
  input: ScenarioEngineInput
): "laag" | "middel" | "hoog" {
  let score = 1;
  const leverCount = input.strategic_hefbomen?.length || 0;
  const causalCount = input.strategic_causal_analysis?.items?.length || 0;
  const mechanism = `${scenario.mechanism} ${scenario.strategic_risk}`.toLowerCase();

  if (leverCount >= 4) score += 1;
  if (causalCount >= 3) score += 1;
  if (/netwerk|partner|ecosysteem|governance/.test(mechanism)) score += 1;
  if (/kwaliteit|cultuur|verlies|druk/.test(mechanism)) score += 1;

  if (score >= 4) return "hoog";
  if (score >= 2) return "middel";
  return "laag";
}
