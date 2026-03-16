export type MissingVariableInput = {
  contextText: string;
  diagnosisText: string;
  insightText: string;
};

export type MissingVariableResult = {
  missingVariables: string[];
};

const VARIABLE_SIGNALS: Array<{ variable: string; patterns: RegExp[] }> = [
  { variable: "regelgeving", patterns: [/\bregelgeving\b/i, /\btoezicht\b/i, /\bigj\b/i] },
  { variable: "marktstructuur", patterns: [/\bmarkt\b/i, /\bconcurrent\b/i, /\bverwijzer\b/i] },
  { variable: "capaciteitslimieten", patterns: [/\bcapaciteit\b/i, /\buitval\b/i, /\bwerkdruk\b/i] },
  { variable: "financiële parameters", patterns: [/\bmarge\b/i, /\bkostprijs\b/i, /\btarief\b/i, /\bliquiditeit\b/i] },
];

export function detectMissingVariables(input: MissingVariableInput): MissingVariableResult {
  const source = `${input.contextText}\n${input.diagnosisText}\n${input.insightText}`;
  const missingVariables = VARIABLE_SIGNALS
    .filter((item) => !item.patterns.some((p) => p.test(source)))
    .map((item) => item.variable);

  return { missingVariables };
}
