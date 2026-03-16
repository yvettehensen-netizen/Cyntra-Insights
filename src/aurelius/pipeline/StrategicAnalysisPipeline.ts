import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";
import {
  buildStrategicAnalysisMap,
  type BuildStrategicAnalysisMapInput,
} from "@/aurelius/analysis/buildStrategicAnalysisMap";

export type StrategicAnalysisPipelineResult = {
  analysisMap: StrategicAnalysisMap;
  pipeline: string[];
  challengeSummary?: string;
  mechanismSummary?: string;
  questionSummary?: string;
  patternSummary?: string;
  redFlagSummary?: string;
};

export function runStrategicAnalysisPipeline(
  input: BuildStrategicAnalysisMapInput
): StrategicAnalysisPipelineResult {
  const analysisMap = buildStrategicAnalysisMap(input);
  return {
    analysisMap,
    challengeSummary: analysisMap.strategyChallenge
      ? `${analysisMap.strategyChallenge.externalPressure} ${analysisMap.strategyChallenge.breakScenario}`
      : undefined,
    mechanismSummary: analysisMap.systemMechanism
      ? `${analysisMap.systemMechanism.cause} ${analysisMap.systemMechanism.mechanism}`
      : undefined,
    questionSummary: analysisMap.strategicQuestions
      ? `${analysisMap.strategicQuestions.raisonDetre} ${analysisMap.strategicQuestions.boardDecision}`
      : undefined,
    patternSummary: analysisMap.strategicPattern
      ? `${analysisMap.strategicPattern.primaryPattern} ${analysisMap.strategicPattern.secondaryPattern}`
      : undefined,
    redFlagSummary: analysisMap.boardroomRedFlags?.[0]
      ? `${analysisMap.boardroomRedFlags[0].category} ${analysisMap.boardroomRedFlags[0].description}`
      : undefined,
    pipeline: [
      "dependency mapping",
      "capacity analysis",
      "red flag detection",
      "source extraction",
      "pattern detection",
      "tension detection",
      "five strategic questions",
      "mechanism mapping",
      "failure analysis",
      "intervention design",
      "evidence normalization",
      "strategic tension detection",
      "decision selection",
      "scenario generation",
      "intervention planning",
      "section drafting",
      "consistency validation",
      "language lint",
      "final render",
    ],
  };
}
