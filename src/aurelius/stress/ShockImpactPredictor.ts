import type { StressScenario } from "./StressScenarioMatrix";

export function predictShockEffect(scenario: StressScenario, context: string): string {
  const source = context.toLowerCase();

  if (scenario === "economische recessie") {
    return /prijs|contract|marge/.test(source)
      ? "Contractdruk en prijsgevoeligheid nemen toe waardoor omzetkwaliteit daalt."
      : "Budgetruimte krimpt waardoor groei en investeringen vertragen.";
  }
  if (scenario === "personeelstekort") {
    return "Capaciteit daalt en sleutelrollen raken moeilijker invulbaar.";
  }
  if (scenario === "vraagshock") {
    return "Instroom groeit sneller dan de huidige triage- en uitvoeringscapaciteit.";
  }
  if (scenario === "beleidswijziging") {
    return "Financiering, prioriteiten en toegangspaden verschuiven sneller dan de organisatie kan aanpassen.";
  }
  return "Vertrouwen in de organisatie daalt waardoor instroom, partners en legitimiteit onder druk komen.";
}
