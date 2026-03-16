import type { AureliusEngineId } from "@/aurelius/engine/engineTypes";
import type {
  AureliusCompleteNodeId,
  AureliusNodeOutput,
  AureliusPipelineState,
} from "@/aurelius/engine/complete/types";

export type AureliusEngineInput = {
  engine: AureliusEngineId;
  nodes: AureliusCompleteNodeId[];
};

export type AureliusGroupedEngine = {
  id: AureliusEngineId;
  nodes: AureliusCompleteNodeId[];
  runEngine: (input: AureliusEngineInput, state: AureliusPipelineState) => AureliusNodeOutput[];
};
