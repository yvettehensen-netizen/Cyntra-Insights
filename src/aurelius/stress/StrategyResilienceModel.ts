import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import type { StressScenario } from "./StressScenarioMatrix";

export function deriveStressRisk(
  scenario: StressScenario,
  levers: StrategicLeverInsight[]
): string {
  const leverText = levers.map((item) => item.lever).join(" ").toLowerCase();

  if (scenario === "personeelstekort") {
    if (/capaciteitsbenutting|talentstrategie|cultuur/.test(leverText)) return "Kwaliteitserosie en wachtdruk bij dalende personeelsbeschikbaarheid.";
    return "Capaciteitstekort remt uitvoering en vertraagt groeiplannen.";
  }
  if (scenario === "economische recessie") {
    return "Marge en investeringsruimte komen onder druk waardoor strategische uitvoering fragiel wordt.";
  }
  if (scenario === "vraagshock") {
    return "Instroomdruk kan de gekozen strategie breken voordat governance kan bijsturen.";
  }
  if (scenario === "beleidswijziging") {
    return "Het huidige operating model kan legitimiteit of contractruimte verliezen.";
  }
  return "Reputatieverlies kan partneradoptie, instroom en bestuurlijke geloofwaardigheid tegelijk raken.";
}

export function deriveStressBoardImplication(scenario: StressScenario): string {
  if (scenario === "personeelstekort") return "Groei temporiseren en kerncapaciteit bestuurlijk beschermen.";
  if (scenario === "economische recessie") return "Portfolio herprioriteren en investeringen aan rendementstoets koppelen.";
  if (scenario === "vraagshock") return "Strengere triage- en capaciteitsguardrails activeren.";
  if (scenario === "beleidswijziging") return "Herbesluit over positionering, contractering en allocatie voorbereiden.";
  return "Crisismandaat, reputatieherstelplan en governance-escalatie direct activeren.";
}
