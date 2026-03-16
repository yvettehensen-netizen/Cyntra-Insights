import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "InterventionArchitectureNode",
  "InterventionPrioritizationNode",
  "ExecutionRiskNode",
  "KPIArchitectureNode",
  "DecisionContractNode",
] as const;

export const ExecutionEngine: AureliusGroupedEngine = {
  id: "ExecutionEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
