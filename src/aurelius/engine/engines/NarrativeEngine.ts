import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "NarrativeCompressionNode",
  "BoardMemoNode",
  "InsightGenerationNode",
  "LanguageDisciplineNode",
  "NarrativeGenerator",
] as const;

export const NarrativeEngine: AureliusGroupedEngine = {
  id: "NarrativeEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
