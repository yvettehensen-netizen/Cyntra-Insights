export type StrategicDecisionOptionInput = {
  code: "A" | "B" | "C";
  description: string;
  financial_effect: string;
  operational_effect: string;
  risk_profile: "Laag" | "Middel" | "Hoog" | "Laag-Middel";
};

export type StrategicScenarioDefinition = {
  key: "scenario_A" | "scenario_B" | "scenario_C";
  code: "A" | "B" | "C";
  name: string;
  model: string;
  option: StrategicDecisionOptionInput;
};

export type StrategicScenarioModelInput = {
  strategic_options: StrategicDecisionOptionInput[];
};

const LEGACY_SCENARIO_ALIASES = ["status_quo", "kernconsolidatie", "gefaseerde strategie"] as const;
void LEGACY_SCENARIO_ALIASES;

function compactLabel(value: string, fallback: string): string {
  const cleaned = String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/[.;:]+$/g, "")
    .trim();
  return cleaned || fallback;
}

function deriveScenarioModel(option: StrategicDecisionOptionInput, fallback: string): string {
  const description = compactLabel(option.description, fallback);
  if (description.length <= 72) return description;
  const short = description.split(/,|;|\./)[0]?.trim();
  return short || fallback;
}

function fallbackOption(code: "A" | "B" | "C"): StrategicDecisionOptionInput {
  if (code === "A") {
    return {
      code,
      description: "Bescherm de kern en beperk parallelle verbreding",
      financial_effect: "Lagere volatiliteit en meer ruimte voor margediscipline",
      operational_effect: "Lagere managementbelasting en meer focus op uitvoerbaarheid",
      risk_profile: "Hoog",
    };
  }
  if (code === "B") {
    return {
      code,
      description: "Versnel verbreding en accepteer hogere uitvoeringsdruk",
      financial_effect: "Hoger omzetpotentieel met groter margerisico",
      operational_effect: "Meer complexiteit en hogere druk op capaciteit",
      risk_profile: "Hoog",
    };
  }
  return {
    code,
    description: "Gefaseerde route met expliciete governance-gates",
    financial_effect: "Gebalanceerde risicoreductie met gefaseerde investeringen",
    operational_effect: "Duidelijke volgorde tussen kernbescherming en selectieve groei",
    risk_profile: "Middel",
  };
}

function optionByCode(
  options: StrategicDecisionOptionInput[],
  code: "A" | "B" | "C"
): StrategicDecisionOptionInput {
  return options.find((item) => item.code === code) ?? fallbackOption(code);
}

export function buildStrategicScenarioModel(
  input: StrategicScenarioModelInput
): StrategicScenarioDefinition[] {
  const options = input.strategic_options ?? [];
  const optionA = optionByCode(options, "A");
  const optionB = optionByCode(options, "B");
  const optionC = optionByCode(options, "C");

  return [
    {
      key: "scenario_A",
      code: "A",
      name: "Scenario A",
      model: deriveScenarioModel(optionA, "status_quo / parallelle strategie"),
      option: optionA,
    },
    {
      key: "scenario_B",
      code: "B",
      name: "Scenario B",
      model: deriveScenarioModel(optionB, "kernconsolidatie / groeipauze"),
      option: optionB,
    },
    {
      key: "scenario_C",
      code: "C",
      name: "Scenario C",
      model: deriveScenarioModel(optionC, "gefaseerde strategie / consolidatie -> verbreding"),
      option: optionC,
    },
  ];
}
