import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "StrategicModeNode",
  "StrategicMechanismNode",
  "ConstraintNode",
  "StrategicPatternNode",
  "StrategicConflictNode",
  "OpportunityCostNode",
  "DecisionPressureNode",
  "StrategicLeverageNode",
  "SystemTransformationNode",
] as const;

export const StrategicMechanismEngine: AureliusGroupedEngine = {
  id: "StrategicMechanismEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
