import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = ["ContextEngine", "CaseClassificationNode", "SectorIntelligenceNode"] as const;

export const ContextEngine: AureliusGroupedEngine = {
  id: "ContextEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
