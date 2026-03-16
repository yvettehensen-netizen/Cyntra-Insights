import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "StructuralForcesNode",
  "SystemActorMappingNode",
  "PowerStructureNode",
  "EconomicEngineNode",
] as const;

export const SystemAnalysisEngine: AureliusGroupedEngine = {
  id: "SystemAnalysisEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
