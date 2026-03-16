import { normalize } from "./storage";
import type { CaseClassification } from "./StrategicMechanismExtractor";
import type { StrategicPatternMatch } from "./StrategicPatternLibrary";

export type StrategicFlywheelOutput = {
  loop: string[];
  narrative: string;
  confidence: number;
};

export function inferStrategicFlywheel(
  rawInput: string,
  classification: CaseClassification,
  pattern: StrategicPatternMatch
): StrategicFlywheelOutput {
  const text = normalize(rawInput).toLowerCase();

  if (classification === "SUCCESS_MODEL" || pattern.pattern === "professional_partnership") {
    const hasOwnership = /(aandelen|mede-eigenaar|aandeelhouder|eigenaarschap)/i.test(text);
    const hasLowOutflow = /(lage uitstroom|minimaal verloop|laag verloop|ziekteverzuim|2[,.]3%)/i.test(text);
    const hasInflow = /(open sollicitaties|instroom|selecteren wie past)/i.test(text);
    const hasQuality = /(kwaliteit|werkplezier|tevredenheid|weinig klachten)/i.test(text);

    const loop = [
      hasOwnership ? "Medewerkersparticipatie en eigenaarschap" : "Autonomie en professionele verantwoordelijkheid",
      hasLowOutflow ? "Lage uitstroom en hoge continuiteit" : "Stabiele teams en hogere betrokkenheid",
      hasQuality ? "Hogere zorgkwaliteit en reputatie" : "Sterkere reputatie en werkgeversaantrekkelijkheid",
      hasInflow ? "Meer kwalitatieve instroom en selectiekracht" : "Betere instroom en talentmatching",
      "Versterking van eigenaarschap en cultuurdiscipline",
    ];

    return {
      loop,
      narrative: `${loop.join(" -> ")}.`,
      confidence: 0.88,
    };
  }

  return {
    loop: [
      "Focus op kerninterventies",
      "Stabilisatie van uitvoering",
      "Verbeterde KPI-trend",
      "Meer bestuurlijk vertrouwen",
      "Ruimte voor volgende strategische stap",
    ],
    narrative:
      "Focus op kerninterventies -> stabilisatie van uitvoering -> verbeterde KPI-trend -> meer bestuurlijk vertrouwen -> ruimte voor volgende strategische stap.",
    confidence: 0.7,
  };
}
