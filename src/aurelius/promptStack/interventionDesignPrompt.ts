export type InterventionDesignPromptInput = {
  recommendedOption?: string;
  dominantRisk?: string;
};

export function buildInterventionDesignPrompt(input: InterventionDesignPromptInput): string {
  return [
    "INTERVENTION PROMPT",
    "ROL",
    "Je bent een implementatiestrateeg.",
    "",
    "DOEL",
    "Vertaal de strategie naar concrete bestuursacties.",
    "",
    "INSTRUCTIES",
    "Genereer minimaal tien interventies.",
    "Elke interventie moet bevatten: actie, eigenaar, termijn, KPI en stopregel.",
    "",
    "REGELS",
    "- geen generieke adviezen",
    "- elke actie moet bestuurbaar zijn",
    "- elke actie moet meetbaar zijn",
    "- geen interventie zonder eigenaar, termijn, KPI en stopregel",
    "",
    `Gekozen richting: ${input.recommendedOption || "onbekend"}`,
    `Dominant risico: ${input.dominantRisk || "onbekend"}`,
    "",
    "FORMAAT",
    "INTERVENTIE 1",
    "",
    "ACTIE",
    "…",
    "EIGENAAR",
    "…",
    "TERMIJN",
    "…",
    "KPI",
    "…",
    "STOPREGEL",
    "…",
    "",
    "INTERVENTIE 2",
    "…",
    "",
    "INTERVENTIE 3",
    "…",
    "",
    "(minimaal 10)",
  ].join("\n");
}

export function validateInterventionDesignOutput(text: string): string[] {
  const issues: string[] = [];
  const count = (String(text ?? "").match(/\bACTIE\b/g) || []).length;
  if (count < 10) issues.push("Interventie-output bevat minder dan 10 interventies.");
  return issues;
}
