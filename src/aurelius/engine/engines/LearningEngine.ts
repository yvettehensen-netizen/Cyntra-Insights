import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = ["StrategicMemoryNode", "CaseSimilarityNode", "InsightRefinementNode"] as const;

export const LearningEngine: AureliusGroupedEngine = {
  id: "LearningEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
