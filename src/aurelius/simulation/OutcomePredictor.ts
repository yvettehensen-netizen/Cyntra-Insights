import type { ScenarioCode, ScenarioEngineInput, StrategyScenario } from "./ScenarioModel";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function optionLabel(code: ScenarioCode, input: ScenarioEngineInput): string {
  const options = input.strategic_options || [];
  const fromOption = options[code === "A" ? 0 : code === "B" ? 1 : 2];
  if (fromOption) return fromOption;

  const combination = input.strategic_hefboom_combinatie?.levers || [];
  if (combination.length >= 3) {
    if (code === "A") return `${combination[0]} gedreven groei`;
    if (code === "B") return `${combination[1]} gedreven versnelling`;
    return `${combination[2]} als gefaseerde governance-route`;
  }

  if (code === "A") return "Bescherm de kern";
  if (code === "B") return "Versnel verbreding";
  return "Gefaseerde governance-route";
}

function causalItem(input: ScenarioEngineInput, index: number) {
  return input.strategic_causal_analysis?.items?.[index] || input.strategic_causal_analysis?.items?.[0] || null;
}

export function predictScenario(code: ScenarioCode, input: ScenarioEngineInput): StrategyScenario {
  const idx = code === "A" ? 0 : code === "B" ? 1 : 2;
  const causal = causalItem(input, idx);
  const name = `Scenario ${code} — ${optionLabel(code, input)}`;

  return {
    scenario: code,
    name,
    mechanism:
      normalize(causal?.mechanisme) ||
      (code === "A"
        ? "Capaciteit wordt beschermd door focus en begrensde verbreding."
        : code === "B"
          ? "Verbreding en extra capaciteit verhogen tempo, maar ook uitvoeringsdruk."
          : "Gefaseerde groei maakt schaal pas mogelijk nadat governance en kerncapaciteit op orde zijn."),
    operational_effect:
      normalize(causal?.operationeelEffect) ||
      (code === "A"
        ? "Teams krijgen meer rust en minder parallelle prioriteiten."
        : code === "B"
          ? "Operationele druk stijgt sneller dan management- en borgingscapaciteit."
          : "Operationele druk daalt alleen als gates en volgorde bestuurlijk worden gehandhaafd."),
    financial_effect:
      normalize(causal?.financieelEffect) ||
      (code === "A"
        ? "Marge en voorspelbaarheid verbeteren doordat verlieslatende spreiding afneemt."
        : code === "B"
          ? "Omzetpotentieel stijgt, maar margerisico en cashdruk nemen toe."
          : "Financiële verbetering wordt gefaseerd vrijgespeeld via scherpere prioritering."),
    strategic_risk:
      normalize(causal?.strategischRisico) ||
      (code === "A"
        ? "Te trage zichtbare groei kan externe druk verhogen."
        : code === "B"
          ? "Kwaliteitsverlies en bestuurlijke overbelasting bij te snelle verbreding."
          : "Gates blijven symbolisch waardoor alsnog sluipende scope-uitbreiding ontstaat."),
    board_implication:
      normalize(causal?.bestuurlijkeImplicatie) ||
      (code === "A"
        ? "Bestuur moet focus, stop-doing en kern-KPI's expliciet maken."
        : code === "B"
          ? "Bestuur moet harde grenzen stellen aan capaciteit, marge en kwaliteitsborging."
          : "Bestuur moet fases, stopregels en escalatiemomenten afdwingbaar maken."),
    risk_level: "middel",
  };
}
