export type DecisionSelectionPromptInput = {
  optionA?: string;
  optionB?: string;
  optionC?: string;
  dominantRisk?: string;
};

export function buildDecisionSelectionPrompt(input: DecisionSelectionPromptInput): string {
  return [
    "DECISION PROMPT",
    "ROL",
    "Je bent een strategisch adviseur voor een raad van bestuur.",
    "",
    "DOEL",
    "Formuleer één duidelijke strategische keuze.",
    "",
    "INSTRUCTIES",
    "Gebruik strategische spanning, systeemmechanisme en breukpunten.",
    "",
    "REGELS",
    "- kies exact één richting",
    "- geen compromis tenzij expliciet noodzakelijk",
    "- onderbouw waarom de andere opties slechter zijn",
    "",
    `Dominant risico: ${input.dominantRisk || "onbekend"}`,
    `Optie A: ${input.optionA || "onbekend"}`,
    `Optie B: ${input.optionB || "onbekend"}`,
    `Optie C: ${input.optionC || "optioneel"}`,
    "",
    "OUTPUTSTRUCTUUR",
    "AANBEVOLEN KEUZE",
    "…",
    "WAAROM DEZE",
    "…",
    "WAAROM NIET B",
    "…",
    "WAAROM NIET C",
    "…",
  ].join("\n");
}

export function validateDecisionSelectionOutput(text: string): string[] {
  const issues: string[] = [];
  for (const required of ["AANBEVOLEN KEUZE", "WAAROM DEZE", "WAAROM NIET B", "WAAROM NIET C"]) {
    if (!String(text ?? "").includes(required)) issues.push(`Besluit-output mist sectie: ${required}`);
  }
  return issues;
}
