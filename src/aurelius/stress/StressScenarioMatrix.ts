export const STRESS_SCENARIOS = [
  "economische recessie",
  "personeelstekort",
  "vraagshock",
  "beleidswijziging",
  "reputatiecrisis",
] as const;

export type StressScenario = (typeof STRESS_SCENARIOS)[number];
