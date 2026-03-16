export type StrategicFailurePromptInput = {
  recommendedOption?: string;
  sourceText?: string;
};

export function buildStrategicFailurePrompt(input: StrategicFailurePromptInput): string {
  return [
    "STRATEGIC FAILURE PROMPT",
    "ROL",
    "Je bent een strategisch criticus.",
    "",
    "DOEL",
    "Test waar de strategie kan falen.",
    "",
    "INSTRUCTIES",
    "Gebruik de strategische spanning en het mechanisme. Genereer minimaal drie strategische breukpunten.",
    "",
    "REGELS",
    "- breekpunten moeten realistisch zijn",
    "- ze moeten voortkomen uit systeemdruk",
    "- vermijd hypothetische fantasie",
    "",
    `Gekozen richting: ${input.recommendedOption || "onbekend"}`,
    `Broncontext: ${input.sourceText || "onbekend"}`,
    "",
    "FORMAAT",
    "BREUKPUNT 1",
    "",
    "BREUKPUNT",
    "…",
    "WAAROM HET FAALT",
    "…",
    "WAT HET BESTUUR MOET WETEN",
    "…",
    "",
    "BREUKPUNT 2",
    "…",
    "",
    "BREUKPUNT 3",
    "…",
  ].join("\n");
}

export function validateStrategicFailureOutput(text: string): string[] {
  const issues: string[] = [];
  const count = (String(text ?? "").match(/\bBREUKPUNT\b/g) || []).length;
  if (count < 3) issues.push("Strategische failure-output bevat minder dan 3 breukpunten.");
  return issues;
}
