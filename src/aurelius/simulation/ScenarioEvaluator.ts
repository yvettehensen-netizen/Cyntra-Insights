import type { ScenarioCode, ScenarioInput, ScenarioResult } from "./ScenarioModel";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function scenarioTitle(code: ScenarioCode, label?: string): string {
  if (label) return `Scenario ${code} — ${label}`;
  if (code === "A") return "Scenario A — bescherm de kern";
  if (code === "B") return "Scenario B — versnel verbreding";
  return "Scenario C — gefaseerde governance-route";
}

function defaultMechanism(code: ScenarioCode, input: ScenarioInput): string {
  const explicit = normalize(input.mechanism);
  if (explicit) return explicit;

  if (code === "A") {
    return "Kernfocus en begrensde verbreding beschermen capaciteit, kwaliteit en bestuurlijke rust.";
  }
  if (code === "B") {
    return "Extra verbreding en nieuw aanbod verhogen tempo, maar vergroten ook coördinatie- en borgingsdruk.";
  }
  return "Gefaseerde opschaling verbindt kernbescherming aan expliciete governance-gates en stopregels.";
}

function defaultOperationalEffect(code: ScenarioCode, input: ScenarioInput): string {
  const explicit = normalize(input.operationalEffect || input.capacityImpact);
  if (explicit) return explicit;

  if (code === "A") return "Teams krijgen meer stabiliteit en minder parallelle prioriteiten.";
  if (code === "B") return "Capaciteitsdruk neemt toe doordat meer tegelijk moet worden geleverd en geborgd.";
  return "Operationele druk daalt alleen als het bestuur de fasering strikt bewaakt.";
}

function defaultFinancialEffect(code: ScenarioCode, input: ScenarioInput): string {
  const explicit = normalize(input.financialEffect);
  if (explicit) return explicit;

  if (code === "A") return "Marge herstelt sneller doordat verlieslatende spreiding wordt begrensd.";
  if (code === "B") return "Omzetpotentieel stijgt, maar margedruk en cashbelasting nemen sneller toe.";
  return "Financiele verbetering komt gefaseerd vrij als governance en focus eerst worden hersteld.";
}

function defaultBoardRisk(code: ScenarioCode, input: ScenarioInput): string {
  const explicit = normalize(input.boardRisk || input.cultureEffect);
  if (explicit) return explicit;

  if (code === "A") return "Externe druk kan oplopen als het bestuur te laat zichtbare resultaten toont.";
  if (code === "B") return "Kwaliteitsverlies en bestuurlijke overbelasting worden het primaire bestuursrisico.";
  return "Gefaseerde groei mislukt als gates niet echt worden gehandhaafd.";
}

function defaultImplication(input: ScenarioInput): string {
  const indicator = normalize(input.warningIndicator);
  const kpi = normalize(input.warningKpi);
  if (indicator && kpi) return `${indicator} vereist monitoring via ${kpi}.`;
  return "Bestuurlijke consequentie: dit scenario vereist expliciete monitoring en herbesluitregels.";
}

export function evaluateScenario(input: ScenarioInput): ScenarioResult {
  return {
    scenario: input.scenario,
    title: scenarioTitle(input.scenario, normalize(input.strategyLabel)),
    mechanism: defaultMechanism(input.scenario, input),
    operationalEffect: defaultOperationalEffect(input.scenario, input),
    financialEffect: defaultFinancialEffect(input.scenario, input),
    boardRisk: defaultBoardRisk(input.scenario, input),
    implication: defaultImplication(input),
  };
}
