import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";
import { buildExtractSourceSignalsPrompt, validateExtractSourceSignalsOutput } from "./extractSourceSignalsPrompt";
import { buildStrategicTensionPrompt, validateStrategicTensionOutput } from "./strategicTensionPrompt";
import { buildMechanismPrompt, validateMechanismOutput } from "./mechanismPrompt";
import { buildStrategicFailurePrompt, validateStrategicFailureOutput } from "./strategicFailurePrompt";
import { buildDecisionSelectionPrompt, validateDecisionSelectionOutput } from "./decisionSelectionPrompt";
import { buildInterventionDesignPrompt, validateInterventionDesignOutput } from "./interventionDesignPrompt";
import { buildBoardEditorialPrompt, validateBoardEditorialOutput } from "./boardEditorialPrompt";

export type PromptStackLayer = {
  key:
    | "source_extraction"
    | "strategic_tension"
    | "mechanism"
    | "strategic_failure"
    | "decision"
    | "intervention"
    | "editorial";
  title: string;
  prompt: string;
  requiredSignals: string[];
};

function takeThirdOption(map?: StrategicAnalysisMap): string {
  return map?.decisionOptions?.[2] || map?.scenarios?.[2]?.name || "optioneel";
}

export function buildBoardroomPromptStack(analysisMap?: StrategicAnalysisMap, sourceText?: string): PromptStackLayer[] {
  return [
    {
      key: "source_extraction",
      title: "Source Extraction",
      prompt: buildExtractSourceSignalsPrompt({
        organisation: analysisMap?.organisation,
        sector: analysisMap?.sector,
        sourceText,
      }),
      requiredSignals: ["FEITEN", "SIGNALEN", "HYPOTHESES", "ACTIEPUNTEN"],
    },
    {
      key: "strategic_tension",
      title: "Strategic Tension",
      prompt: buildStrategicTensionPrompt({
        dominantRisk: analysisMap?.dominantRisk,
        decisionOptions: analysisMap?.decisionOptions,
      }),
      requiredSignals: ["Strategische spanning", "VS"],
    },
    {
      key: "mechanism",
      title: "Mechanism",
      prompt: buildMechanismPrompt({
        dominantRisk: analysisMap?.dominantRisk,
        patternMechanism: analysisMap?.strategicPattern?.mechanism,
        sourceFacts: sourceText,
      }),
      requiredSignals: ["SYMPTOOM", "OORZAAK", "SYSTEEMDRUK", "GEVOLG"],
    },
    {
      key: "strategic_failure",
      title: "Strategic Failure",
      prompt: buildStrategicFailurePrompt({
        recommendedOption: analysisMap?.recommendedOption,
        sourceText,
      }),
      requiredSignals: ["BREUKPUNT"],
    },
    {
      key: "decision",
      title: "Decision",
      prompt: buildDecisionSelectionPrompt({
        optionA: analysisMap?.strategicTension.optionA,
        optionB: analysisMap?.strategicTension.optionB,
        optionC: takeThirdOption(analysisMap),
        dominantRisk: analysisMap?.dominantRisk,
      }),
      requiredSignals: ["AANBEVOLEN KEUZE", "WAAROM DEZE", "WAAROM NIET B", "WAAROM NIET C"],
    },
    {
      key: "intervention",
      title: "Intervention",
      prompt: buildInterventionDesignPrompt({
        recommendedOption: analysisMap?.recommendedOption,
        dominantRisk: analysisMap?.dominantRisk,
      }),
      requiredSignals: ["ACTIE", "EIGENAAR", "TERMIJN", "KPI", "STOPREGEL"],
    },
    {
      key: "editorial",
      title: "Editorial",
      prompt: buildBoardEditorialPrompt({
        organisation: analysisMap?.organisation,
        sector: analysisMap?.sector,
      }),
      requiredSignals: ["geen prompt labels", "geen halve zinnen", "geen Engels"],
    },
  ];
}

export function validatePromptStackStep(layerKey: PromptStackLayer["key"], output: string): string[] {
  switch (layerKey) {
    case "source_extraction":
      return validateExtractSourceSignalsOutput(output);
    case "strategic_tension":
      return validateStrategicTensionOutput(output);
    case "mechanism":
      return validateMechanismOutput(output);
    case "strategic_failure":
      return validateStrategicFailureOutput(output);
    case "decision":
      return validateDecisionSelectionOutput(output);
    case "intervention":
      return validateInterventionDesignOutput(output);
    case "editorial":
      return validateBoardEditorialOutput(output);
    default:
      return [];
  }
}

export function renderPromptStackForNarrative(analysisMap?: StrategicAnalysisMap, sourceText?: string): string {
  const layers = buildBoardroomPromptStack(analysisMap, sourceText);
  return [
    "PROMPTSTACK DISCIPLINE",
    ...layers.flatMap((layer, index) => [
      `${index + 1}. ${layer.title}`,
      layer.prompt,
      "",
    ]),
  ].join("\n");
}
