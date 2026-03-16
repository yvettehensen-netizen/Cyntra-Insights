export type NarrativeStructureResult = {
  pass: boolean;
  missing: string[];
  matched: string[];
};

const REQUIRED_STRUCTURE = [
  "0 SITUATIERECONSTRUCTIE",
  "1 DOMINANTE THESE",
  "2 KERNCONFLICT",
  "3 KEERZIJDE VAN DE KEUZE",
  "4 PRIJS VAN UITSTEL",
  "5 GOVERNANCE IMPACT",
  "6 MACHTSDYNAMIEK",
  "7 EXECUTIERISICO",
  "8 INTERVENTIEONTWERP",
  "9 BESLUITKADER",
] as const;

function hasSection(text: string, section: string): boolean {
  const source = String(text ?? "");
  if (section === "8 INTERVENTIEONTWERP") {
    return /###\s*(?:8\.\s*INTERVENTIEONTWERP|10\.\s*90-DAGEN INTERVENTIEPROGRAMMA)/i.test(source);
  }
  if (section === "9 BESLUITKADER") {
    return /###\s*(?:9\.\s*BESLUITKADER|12\.\s*BESLUITKADER)/i.test(source);
  }
  return new RegExp(String.raw`(?:^|\n)\s*(?:###\s*)?${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\b`, "i").test(source);
}

export function validateNarrativeStructure(text: string): NarrativeStructureResult {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const section of REQUIRED_STRUCTURE) {
    if (hasSection(text, section)) {
      matched.push(section);
    } else {
      missing.push(section);
    }
  }

  return {
    pass: missing.length === 0,
    missing,
    matched,
  };
}
