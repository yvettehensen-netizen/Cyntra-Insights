import type { TrajectoryPoint } from "./SystemTrajectoryModel";

export type ForesightScenario = {
  id: "SCENARIO_1" | "SCENARIO_2" | "SCENARIO_3";
  name: "STATUS_QUO" | "INTERVENTIE" | "ESCALATIE";
  description: string;
  trajectory: TrajectoryPoint[];
};

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatForesightScenario(scenario: ForesightScenario): string {
  const fin = avg(scenario.trajectory.map((t) => t.financialPressure));
  const cap = avg(scenario.trajectory.map((t) => t.capacityPressure));
  const risk = avg(scenario.trajectory.map((t) => t.strategicRisk));

  if (scenario.name === "STATUS_QUO") {
    return [
      "SCENARIO 1 — STATUS QUO",
      "WAT GEBEURT ALS NIETS VERANDERT:",
      scenario.description,
      `Financiële ontwikkeling: druk stijgt richting ${pct(fin)}.`,
      `Capaciteitsontwikkeling: belasting stijgt richting ${pct(cap)}.`,
      `Strategische risico's: risico-opbouw richting ${pct(risk)} zonder trendbreuk.`,
    ].join("\n");
  }
  if (scenario.name === "INTERVENTIE") {
    return [
      "SCENARIO 2 — INTERVENTIE",
      "WAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD:",
      scenario.description,
      `Herstel financiële stabiliteit: druk daalt richting ${pct(fin)}.`,
      `Impact op capaciteit: belasting daalt richting ${pct(cap)}.`,
      `Impact op strategische positie: risiconiveau daalt richting ${pct(risk)}.`,
    ].join("\n");
  }
  return [
    "SCENARIO 3 — ESCALATIE",
    "WAT GEBEURT ALS HET PROBLEEM VERERGERT:",
    scenario.description,
    `Financiële ontwikkeling: versnellende druk richting ${pct(fin)}.`,
    `Capaciteitsontwikkeling: versnellend verlies richting ${pct(cap)}.`,
    `Strategische risico's: escalatie richting ${pct(risk)} met kans op stagnatie.`,
  ].join("\n");
}
