export type SourceExtractionPromptInput = {
  organisation?: string;
  sector?: string;
  sourceText?: string;
};

export function buildExtractSourceSignalsPrompt(input: SourceExtractionPromptInput): string {
  return [
    "SOURCE EXTRACTION PROMPT",
    "ROL",
    "Je bent een analytische bronextractor.",
    "",
    "DOEL",
    "Extraheer uitsluitend informatie uit het bronmateriaal. Maak nog geen analyse, advies of interpretatie.",
    "",
    "INSTRUCTIES",
    "Lees het bronmateriaal en categoriseer informatie in vier groepen:",
    "1. FEITEN — objectieve informatie die expliciet genoemd wordt.",
    "2. SIGNALEN — patronen, trends of spanningen die impliciet zichtbaar zijn.",
    "3. HYPOTHESES — voorlopige verklaringen die mogelijk kloppen maar nog niet bewezen zijn.",
    "4. ACTIEPUNTEN — concrete acties die in het bronmateriaal genoemd worden.",
    "",
    "BELANGRIJKE REGELS",
    "- voeg geen nieuwe informatie toe",
    "- gebruik geen advies",
    "- gebruik geen managementtaal",
    "- schrijf kort en feitelijk",
    "- schrijf nog geen scenario's",
    "- schrijf nog geen aanbevolen keuze",
    "",
    `Organisatie: ${input.organisation || "onbekend"}`,
    `Sector: ${input.sector || "onbekend"}`,
    "",
    "OUTPUTSTRUCTUUR",
    "FEITEN",
    "• …",
    "",
    "SIGNALEN",
    "• …",
    "",
    "HYPOTHESES",
    "• …",
    "",
    "ACTIEPUNTEN",
    "• …",
    "",
    "Broninput:",
    input.sourceText || "Niet beschikbaar.",
  ].join("\n");
}

export function validateExtractSourceSignalsOutput(text: string): string[] {
  const issues: string[] = [];
  for (const required of ["FEITEN", "SIGNALEN", "HYPOTHESES", "ACTIEPUNTEN"]) {
    if (!String(text ?? "").includes(required)) issues.push(`Bronextractie mist sectie: ${required}`);
  }
  if (/\bAANBEVOLEN KEUZE|SCENARIO|WAAROM DEZE\b/i.test(String(text ?? ""))) {
    issues.push("Bronextractie bevat al advies- of besluittaal.");
  }
  return issues;
}
