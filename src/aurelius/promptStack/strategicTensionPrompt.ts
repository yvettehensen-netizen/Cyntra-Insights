export type StrategicTensionPromptInput = {
  dominantRisk?: string;
  decisionOptions?: string[];
};

export function buildStrategicTensionPrompt(input: StrategicTensionPromptInput): string {
  return [
    "STRATEGIC TENSION PROMPT",
    "ROL",
    "Je bent een strategisch denker.",
    "",
    "DOEL",
    "Identificeer exact één centrale strategische spanning.",
    "",
    "INSTRUCTIES",
    "Analyseer de bronextractie en zoek de belangrijkste strategische spanning waar het bestuur een keuze moet maken.",
    "",
    "REGELS",
    "- formuleer exact één spanning",
    "- geen lijst met meerdere problemen",
    "- geen advies of acties",
    "- geen samenvatting van het gesprek",
    "- exact één spanning in formaat A VS B",
    "",
    `Dominant risico: ${input.dominantRisk || "onbekend"}`,
    "Beschikbare richtingen:",
    ...(input.decisionOptions?.map((item) => `- ${item}`) || ["- Niet beschikbaar"]),
    "",
    "FORMAAT",
    "Strategische spanning:",
    "A",
    "VS",
    "B",
    "",
    "Uitleg",
    "Leg in maximaal drie zinnen uit waarom dit de centrale spanning is.",
  ].join("\n");
}

export function validateStrategicTensionOutput(text: string): string[] {
  const issues: string[] = [];
  const source = String(text ?? "");
  if (!/VS/i.test(source)) issues.push("Strategische spanning mist VS-contrast.");
  if ((source.match(/\bVS\b/gi) || []).length > 1) issues.push("Strategische spanning bevat meer dan één hoofdcontrast.");
  return issues;
}
