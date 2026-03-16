import type { StrategicScenarioDefinition } from "./StrategicScenarioModel";

export type StrategicSimulationInputEnvelope = {
  context_state: {
    sector: string;
    organisatiegrootte: string;
    verdienmodel: string;
    kostenstructuur: string;
    marktcontext: string;
    governancecontext: string;
  };
  diagnosis: {
    dominant_problem: string;
    financial_pressure: string;
    organizational_constraints: string;
    market_constraints: string;
    governance_constraints: string;
  };
  mechanisms: Array<{
    symptom: string;
    mechanism: string;
    root_cause: string;
    leverage_point: string;
  }>;
  strategic_insights: Array<{
    strategic_pattern: string;
    implication: string;
    recommended_focus: string;
  }>;
  historical_patterns?: Array<{
    pattern_description: string;
    strategic_implication: string;
  }>;
};

export type StrategicSimulationScenarioResult = {
  financial_impact: {
    marge_delta: string;
    cash_delta: string;
    cost_change: string;
    revenue_change: string;
  };
  capacity_impact: {
    fte_change: string;
    client_capacity: string;
    productivity_change: string;
  };
  execution_risk: {
    level: "low" | "medium" | "high";
    organization_complexity: string;
    management_load: string;
    implementation_risk: string;
  };
  time_to_effect: {
    short_term: string;
    mid_term: string;
    long_term: string;
  };
  strategic_tradeoffs: {
    gain: string;
    loss: string;
  };
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function scorePressure(source: string): number {
  const low = source.toLowerCase();
  let score = 0;
  if (/(marge|kostprijs|tarief|contract|plafond|liquiditeit|cash)/.test(low)) score += 2;
  if (/(capaciteit|planning|werkdruk|productiviteit|no-show|uitval)/.test(low)) score += 2;
  if (/(mandaat|governance|escalatie|besluit|onderstroom)/.test(low)) score += 2;
  return Math.max(1, Math.min(6, score));
}

function buildFinancialImpact(
  code: "A" | "B" | "C",
  pressureScore: number
): StrategicSimulationScenarioResult["financial_impact"] {
  if (code === "A") {
    return {
      marge_delta: `-${4 + pressureScore}% verwacht bij parallelle druk`,
      cash_delta: `Negatief binnen 30-90 dagen door hogere volatiliteit`,
      cost_change: `+${2 + pressureScore}% door coördinatie- en frictiekosten`,
      revenue_change: `Licht positief potentieel, maar onvoldoende voor margedekking`,
    };
  }
  if (code === "B") {
    return {
      marge_delta: `+${2 + Math.floor(pressureScore / 2)}% door focus op kernmarge`,
      cash_delta: `Stabilisatie verwacht binnen 30-60 dagen`,
      cost_change: `-${1 + Math.floor(pressureScore / 2)}% via stop-doing en focus`,
      revenue_change: `Tijdelijk vlak tot licht negatief buiten de kern`,
    };
  }
  return {
    marge_delta: `+${1 + Math.floor(pressureScore / 2)}% met gefaseerde verbetering`,
    cash_delta: `Verbetering vanaf 60-90 dagen bij gate-discipline`,
    cost_change: `Initieel +1% transitie, daarna daling door betere allocatie`,
    revenue_change: `Gematigde groei na kernstabilisatie`,
  };
}

function buildCapacityImpact(
  code: "A" | "B" | "C"
): StrategicSimulationScenarioResult["capacity_impact"] {
  if (code === "A") {
    return {
      fte_change: "-0.5 tot -1.5 FTE effectieve capaciteit door versnippering",
      client_capacity: "Dalend of stagnerend bij oplopende wachtdruk",
      productivity_change: "Negatief door context-switching en prioriteitsconflict",
    };
  }
  if (code === "B") {
    return {
      fte_change: "+0.3 tot +1.0 FTE effectieve kerncapaciteit",
      client_capacity: "Stabiel tot stijgend in kernpropositie",
      productivity_change: "Positief door focus en voorspelbaarder ritme",
    };
  }
  return {
    fte_change: "0 tot +0.8 FTE, afhankelijk van fasegate-discipline",
    client_capacity: "Eerst stabilisatie, daarna gecontroleerde groei",
    productivity_change: "Licht positief na initiële transitiefrictie",
  };
}

function buildExecutionRisk(
  code: "A" | "B" | "C"
): StrategicSimulationScenarioResult["execution_risk"] {
  if (code === "A") {
    return {
      level: "high",
      organization_complexity: "Hoog door parallelle strategische belasting",
      management_load: "Hoog; MT verdeeld over concurrerende prioriteiten",
      implementation_risk: "Hoog risico op besluituitstel en scope-erosie",
    };
  }
  if (code === "B") {
    return {
      level: "medium",
      organization_complexity: "Middel; eenvoudiger focus, maar veranderdruk blijft",
      management_load: "Middel; concentratie op kernverbetering",
      implementation_risk: "Middel door mogelijke weerstand op groeipauze",
    };
  }
  return {
    level: "medium",
    organization_complexity: "Middel-hoog door fasering en dubbele tijdlijn",
    management_load: "Middel; vereist strakke gate-governance",
    implementation_risk: "Middel bij discipline, hoog bij gate-overschrijding",
  };
}

function buildTimeToEffect(
  code: "A" | "B" | "C"
): StrategicSimulationScenarioResult["time_to_effect"] {
  if (code === "A") {
    return {
      short_term: "Snelle activiteitstoename, maar zonder structurele stabilisatie",
      mid_term: "Verhoogde kans op capaciteits- en cashfrictie",
      long_term: "Toenemende strategische fragiliteit",
    };
  }
  if (code === "B") {
    return {
      short_term: "Binnen 30-60 dagen zichtbaar op focus en ritme",
      mid_term: "Binnen 90 dagen meetbaar op marge en capaciteit",
      long_term: "Sterkere basis voor latere verbreding",
    };
  }
  return {
    short_term: "Binnen 30 dagen governance- en stop/go-structuur",
    mid_term: "Binnen 90 dagen kernstabilisatie met selectieve verbreding",
    long_term: "Gebalanceerde schaalbaarheid mits discipline standhoudt",
  };
}

function buildTradeoffs(
  code: "A" | "B" | "C"
): StrategicSimulationScenarioResult["strategic_tradeoffs"] {
  if (code === "A") {
    return {
      gain: "Korte-termijn momentum op meerdere fronten",
      loss: "Margecontrole, uitvoeringsfocus en voorspelbaarheid",
    };
  }
  if (code === "B") {
    return {
      gain: "Kernstabiliteit, kasdiscipline en operationele rust",
      loss: "Tijdelijke groeisnelheid buiten de kern",
    };
  }
  return {
    gain: "Balans tussen risicobeheersing en groeipotentieel",
    loss: "Hogere governance- en coördinatie-eisen in transitie",
  };
}

export function calculateStrategicImpact(
  scenario: StrategicScenarioDefinition,
  input: StrategicSimulationInputEnvelope
): StrategicSimulationScenarioResult {
  const pressureSource = [
    input.diagnosis.financial_pressure,
    input.diagnosis.organizational_constraints,
    input.diagnosis.market_constraints,
    input.diagnosis.governance_constraints,
    ...input.mechanisms.map((item) => item.mechanism),
    ...input.strategic_insights.map((item) => item.implication),
    ...(input.historical_patterns ?? []).map((item) => item.pattern_description),
  ]
    .filter(Boolean)
    .join(" ");

  const pressureScore = scorePressure(normalize(pressureSource));

  return {
    financial_impact: buildFinancialImpact(scenario.code, pressureScore),
    capacity_impact: buildCapacityImpact(scenario.code),
    execution_risk: buildExecutionRisk(scenario.code),
    time_to_effect: buildTimeToEffect(scenario.code),
    strategic_tradeoffs: buildTradeoffs(scenario.code),
  };
}
