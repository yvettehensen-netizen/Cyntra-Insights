export type NarrativeCausalityResult = {
  pass: boolean;
  signals: string[];
  missingSignals: string[];
};

const REQUIRED_CAUSAL_LINKS: Array<{ signal: string; pattern: RegExp }> = [
  {
    signal: "SITUATIE -> KERNCONFLICT",
    pattern: /(?:situatiereconstructie|huidige situatie)[\s\S]{0,1200}(?:kernconflict|conflict)/i,
  },
  {
    signal: "KERNCONFLICT -> DOMINANTE THESE",
    pattern: /kernconflict[\s\S]{0,1200}(?:dominante these|these)/i,
  },
  {
    signal: "THESE -> INTERVENTIE",
    pattern: /(?:dominante these|these)[\s\S]{0,1600}(?:interventie|90-dagen interventieprogramma|interventieontwerp)/i,
  },
  {
    signal: "SPANNING + REALITEIT + KEUZE",
    pattern: /(?:probeert te bereiken|doel|ambitie)[\s\S]{0,1200}(?:structurele realiteit|beperking|belemmert)[\s\S]{0,1200}(?:keuze|noodzakelijk|onvermijdelijk)/i,
  },
];

export function validateNarrativeCausality(text: string): NarrativeCausalityResult {
  const source = String(text ?? "");
  const signals: string[] = [];
  const missingSignals: string[] = [];

  for (const item of REQUIRED_CAUSAL_LINKS) {
    if (item.pattern.test(source)) {
      signals.push(item.signal);
    } else {
      missingSignals.push(item.signal);
    }
  }

  return {
    pass: missingSignals.length === 0,
    signals,
    missingSignals,
  };
}
