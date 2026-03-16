import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "DominantThesisNode",
  "StrategicOptionsNode",
  "TradeOffAnalysisNode",
  "ScenarioSimulationNode",
  "BoardDecisionNode",
] as const;

export const StrategicDecisionEngine: AureliusGroupedEngine = {
  id: "StrategicDecisionEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
