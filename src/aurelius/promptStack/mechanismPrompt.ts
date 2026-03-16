export type MechanismPromptInput = {
  dominantRisk?: string;
  patternMechanism?: string;
  sourceFacts?: string;
};

export function buildMechanismPrompt(input: MechanismPromptInput): string {
  return [
    "MECHANISM PROMPT",
    "ROL",
    "Je bent een systeemanalist.",
    "",
    "DOEL",
    "Leg het onderliggende mechanisme achter de strategische spanning uit.",
    "",
    "INSTRUCTIES",
    "Gebruik de strategische spanning en bronextractie om het systeem te verklaren.",
    "Analyseer volgens deze keten:",
    "symptoom -> oorzaak -> systeemdruk -> gevolg",
    "",
    "REGELS",
    "- elke stap moet logisch volgen uit de vorige",
    "- geen generieke formuleringen",
    "- geen advies",
    "- elke conclusie moet een oorzaak-gevolgketen bevatten",
    "",
    `Dominant risico: ${input.dominantRisk || "onbekend"}`,
    `Patroonmechanisme: ${input.patternMechanism || "onbekend"}`,
    `Bronbasis: ${input.sourceFacts || "onbekend"}`,
    "",
    "OUTPUTSTRUCTUUR",
    "SYSTEEMMECHANISME",
    "",
    "SYMPTOOM",
    "…",
    "OORZAAK",
    "…",
    "SYSTEEMDRUK",
    "…",
    "GEVOLG",
    "…",
  ].join("\n");
}

export function validateMechanismOutput(text: string): string[] {
  const issues: string[] = [];
  for (const required of ["SYMPTOOM", "OORZAAK", "SYSTEEMDRUK", "GEVOLG"]) {
    if (!String(text ?? "").includes(required)) issues.push(`Mechanisme-output mist sectie: ${required}`);
  }
  return issues;
}
