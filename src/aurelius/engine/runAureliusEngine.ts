import {
  BOARDROOM_INTERVENTION_PIPELINE,
} from "@/aurelius/engine/boardroom";
import { AURELIUS_COMPLETE_PIPELINE } from "@/aurelius/engine/complete";

const REQUIRED_STRATEGIC_NODES = [
  "DominantThesisNode",
  "StrategicConflictNode",
  "StrategicOptionsNode",
  "BoardDecisionNode",
  "InsightGenerationNode",
  "InterventionArchitectureNode",
  "ExecutionRiskNode",
  "DecisionContractNode",
  "BoardMemoNode",
] as const;

function pipelineHasRequiredNodes(pipeline: string[]): boolean {
  return REQUIRED_STRATEGIC_NODES.every((node) => pipeline.includes(node));
}

export const AURELIUS_STRATEGIC_PIPELINE = pipelineHasRequiredNodes(AURELIUS_COMPLETE_PIPELINE)
  ? AURELIUS_COMPLETE_PIPELINE
  : BOARDROOM_INTERVENTION_PIPELINE;
export const AURELIUS_LEGACY_COMPLETE_PIPELINE = AURELIUS_COMPLETE_PIPELINE;

export function getAureliusStrategicPipeline(): string[] {
  return [...AURELIUS_STRATEGIC_PIPELINE];
}

export function validateStrategicPipelineGuardrails(): { ok: boolean; missing: string[] } {
  const pipeline = getAureliusStrategicPipeline();
  const missing = REQUIRED_STRATEGIC_NODES.filter((node) => !pipeline.includes(node));
  return {
    ok: missing.length === 0,
    missing,
  };
}
