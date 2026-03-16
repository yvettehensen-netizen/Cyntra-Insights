import type { StrategicLever } from "./StrategicLeverMatrix";
import type { StrategicLeverInsight } from "./StrategicLeverDetector";

export type LeverCombinationInsight = {
  levers: [StrategicLever, StrategicLever, StrategicLever];
  strategicEffect: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function combinationEffect(levers: StrategicLever[]): string {
  const joined = levers.join(" ");
  if (/(netwerkstrategieën|ecosystemen)/.test(joined) && /(governance|besluitritme)/.test(joined)) {
    return "Impact groeit sneller dan personeelscapaciteit, mits kwaliteitsborging bestuurlijk wordt afgedwongen.";
  }
  if (/(automatisering|procesoptimalisatie)/.test(joined) && /(capaciteitsbenutting|prijsstrategie)/.test(joined)) {
    return "Doorvoer en marge kunnen tegelijk stijgen doordat efficiency direct wordt vertaald naar betere economics.";
  }
  if (/(positionering|merkautoriteit)/.test(joined) && /(distributiemacht|nieuwe segmenten|marktuitbreiding)/.test(joined)) {
    return "De organisatie vergroot marktmacht doordat onderscheidend vermogen sneller wordt omgezet in toegang en groei.";
  }
  if (/(data-infrastructuur|besluitritme)/.test(joined) && /(governance|leiderschap)/.test(joined)) {
    return "Strategische snelheid stijgt doordat signalen sneller leiden tot bestuurlijke koerscorrectie.";
  }
  return "Deze hefboomcombinatie vergroot strategische slagkracht doordat meerdere waarde- en executiemechanismen tegelijk worden versterkt.";
}

export function analyzeLeverCombination(
  insights: StrategicLeverInsight[],
  sourceText = ""
): LeverCombinationInsight | null {
  const ranked = [...insights]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.lever);

  if (ranked.length < 3) return null;

  const normalizedSource = normalize(sourceText).toLowerCase();
  const selectedLevers = [...ranked] as [StrategicLever, StrategicLever, StrategicLever];

  if (/beleid|institutioneel|regionaal/.test(normalizedSource) && !selectedLevers.includes("governance")) {
    selectedLevers[2] = "governance";
  }

  return {
    levers: selectedLevers,
    strategicEffect: combinationEffect(selectedLevers),
  };
}
