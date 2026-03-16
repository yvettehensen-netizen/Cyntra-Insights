import { buildTrajectory } from "./SystemTrajectoryModel";
import { formatForesightScenario, type ForesightScenario } from "./ScenarioGenerator";

export type StrategicForesightInput = {
  contextText: string;
  causalText: string;
  interventionText: string;
};

export type StrategicForesightResult = {
  scenarios: ForesightScenario[];
  block: string;
};

function scoreFromSignals(text: string, signals: string[]): number {
  const src = String(text ?? "").toLowerCase();
  const hits = signals.reduce((acc, s) => acc + (src.includes(s.toLowerCase()) ? 1 : 0), 0);
  return Math.max(0.2, Math.min(0.9, 0.2 + hits * 0.1));
}

export function runStrategicForesight(input: StrategicForesightInput): StrategicForesightResult {
  const source = `${input.contextText}\n${input.causalText}\n${input.interventionText}`;
  const baseFinancialPressure = scoreFromSignals(source, [
    "marge",
    "kostprijs",
    "tariefdruk",
    "contract",
    "verlies",
    "liquiditeit",
  ]);
  const baseCapacityPressure = scoreFromSignals(source, [
    "capaciteit",
    "werkdruk",
    "uitval",
    "productiviteit",
    "planning",
  ]);

  const interventionEffect = scoreFromSignals(input.interventionText, [
    "actie",
    "eigenaar",
    "kpi",
    "deadline",
    "escalatie",
  ]) * 0.55;
  const escalationFactor = scoreFromSignals(source, ["uitstel", "stagnatie", "escalatie"]) * 0.5;

  const scenarios: ForesightScenario[] = [
    {
      id: "SCENARIO_1",
      name: "STATUS_QUO",
      description:
        "De organisatie houdt huidige koers en ritmes aan zonder aanvullende structurele interventies.",
      trajectory: buildTrajectory(
        { baseFinancialPressure, baseCapacityPressure, interventionEffect, escalationFactor },
        "status_quo"
      ),
    },
    {
      id: "SCENARIO_2",
      name: "INTERVENTIE",
      description:
        "De organisatie voert het interventieprogramma consistent uit met governance- en capaciteitsdiscipline.",
      trajectory: buildTrajectory(
        { baseFinancialPressure, baseCapacityPressure, interventionEffect, escalationFactor },
        "interventie"
      ),
    },
    {
      id: "SCENARIO_3",
      name: "ESCALATIE",
      description:
        "Financiële en operationele druk verergert door uitstel, beperkte correctie en toenemende systeemfrictie.",
      trajectory: buildTrajectory(
        { baseFinancialPressure, baseCapacityPressure, interventionEffect, escalationFactor },
        "escalatie"
      ),
    },
  ];

  const block = [
    formatForesightScenario(scenarios[0]),
    "",
    formatForesightScenario(scenarios[1]),
    "",
    formatForesightScenario(scenarios[2]),
  ].join("\n");

  return { scenarios, block };
}
