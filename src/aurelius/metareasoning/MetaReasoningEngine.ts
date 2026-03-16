import {
  checkLogicConsistency,
  type LogicConsistencyInput,
  type LogicConsistencyResult,
} from "./LogicConsistencyChecker";
import {
  generateAlternativeExplanations,
  type AlternativeExplanationInput,
  type AlternativeExplanation,
} from "./AlternativeExplanationGenerator";
import {
  detectMissingVariables,
  type MissingVariableInput,
  type MissingVariableResult,
} from "./MissingVariableDetector";

export type MetaReasoningInput = {
  logicInput: LogicConsistencyInput;
  alternativeInput: AlternativeExplanationInput;
  missingVariableInput: MissingVariableInput;
};

export type MetaReasoningResult = {
  logic: LogicConsistencyResult;
  alternatives: AlternativeExplanation[];
  missing: MissingVariableResult;
  confidence: number;
  block: string;
};

export function runMetaReasoning(input: MetaReasoningInput): MetaReasoningResult {
  const logic = checkLogicConsistency(input.logicInput);
  const alternatives = generateAlternativeExplanations(input.alternativeInput);
  const missing = detectMissingVariables(input.missingVariableInput);

  const altUncertainty = alternatives.filter((a) => a.plausibility >= 0.55).length;
  const confidenceBase = logic.score - altUncertainty * 0.08 - missing.missingVariables.length * 0.04;
  const confidence = Math.max(0.1, Math.min(0.95, Number(confidenceBase.toFixed(2))));

  const block = [
    "WAAR DE ANALYSE STERK IS",
    logic.strengths.length ? logic.strengths.join(" | ") : "Causale en strategische koppeling is beperkt expliciet.",
    "",
    "WAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN",
    alternatives
      .map(
        (a, idx) =>
          `${idx + 1}. ${a.explanation} (plausibiliteit ${a.plausibility.toFixed(
            2
          )}) | bewijs: ${a.evidence} | tegenbewijs: ${a.counterEvidence}`
      )
      .join("\n"),
    "",
    "WELKE VARIABELEN MOGELIJK ONTBREKEN",
    missing.missingVariables.length
      ? missing.missingVariables.join(", ")
      : "Geen kritieke ontbrekende variabelen gedetecteerd op huidige context.",
    "",
    "HOE ZEKER DE CONCLUSIE IS",
    `Meta-zekerheidsscore: ${(confidence * 100).toFixed(0)}% (logische consistentie ${(
      logic.score * 100
    ).toFixed(0)}%).`,
  ].join("\n");

  return {
    logic,
    alternatives,
    missing,
    confidence,
    block,
  };
}
