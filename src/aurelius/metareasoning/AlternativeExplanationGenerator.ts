export type AlternativeExplanationInput = {
  hypothesisText: string;
  blindSpotText: string;
  contextText: string;
};

export type AlternativeExplanation = {
  explanation: string;
  plausibility: number;
  evidence: string;
  counterEvidence: string;
};

function extractLine(source: string, re: RegExp, fallback: string): string {
  return String(source.match(re)?.[1] ?? fallback).trim();
}

export function generateAlternativeExplanations(
  input: AlternativeExplanationInput
): AlternativeExplanation[] {
  const source = `${input.hypothesisText}\n${input.blindSpotText}\n${input.contextText}`;

  const alt1: AlternativeExplanation = {
    explanation: "Het kernprobleem is primair governance-frictie, niet marktdruk.",
    plausibility: /mandaat|uitstel|conflict|onderstroom/i.test(source) ? 0.72 : 0.48,
    evidence: extractLine(
      source,
      /(uitstel[^\n]{0,180}|mandaat[^\n]{0,180}|conflict[^\n]{0,180})/i,
      "Signalen van besluituitstel en mandaatonduidelijkheid."
    ),
    counterEvidence: "Externe contract- en tariefdruk kan alsnog dominante driver zijn.",
  };

  const alt2: AlternativeExplanation = {
    explanation: "Het kernprobleem is primair financiële modeldruk, niet organisatiegedrag.",
    plausibility: /marge|tarief|kostprijs|contract|plafond/i.test(source) ? 0.74 : 0.5,
    evidence: extractLine(
      source,
      /(marge[^\n]{0,180}|tarief[^\n]{0,180}|kostprijs[^\n]{0,180}|contract[^\n]{0,180})/i,
      "Signalen van structurele marge- en contractdruk."
    ),
    counterEvidence: "Sterke governance- en gedragseffecten kunnen financiële druk versterken.",
  };

  const alt3: AlternativeExplanation = {
    explanation: "Het kernprobleem is strategische scopeversnippering door te veel parallelle agenda's.",
    plausibility: /parallel|initiatief|versnipper|prioritering|stopregel/i.test(source) ? 0.69 : 0.46,
    evidence: extractLine(
      source,
      /(parallel[^\n]{0,180}|initiatief[^\n]{0,180}|prioritering[^\n]{0,180})/i,
      "Signalen van parallelle prioriteiten en ontbrekende stopregels."
    ),
    counterEvidence: "Bij sterke marktdruk kan zelfs scherpe prioritering onvoldoende zijn.",
  };

  return [alt1, alt2, alt3];
}
