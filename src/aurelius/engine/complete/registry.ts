import type {
  AureliusCompleteNodeId,
  AureliusNodeProcessor,
} from "./types";
import { AURELIUS_COMPLETE_PIPELINE } from "./architecture";
import { createNodeProcessor } from "./nodeRuntime";

export const AURELIUS_COMPLETE_NODE_REGISTRY: Record<AureliusCompleteNodeId, AureliusNodeProcessor> =
  Object.fromEntries(
    AURELIUS_COMPLETE_PIPELINE.map((node) => [node, createNodeProcessor(node)])
  ) as Record<AureliusCompleteNodeId, AureliusNodeProcessor>;

export function getRegisteredNodeProcessor(node: AureliusCompleteNodeId): AureliusNodeProcessor {
  return AURELIUS_COMPLETE_NODE_REGISTRY[node];
}
