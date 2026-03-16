import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type { AureliusGroupedEngine } from "./types";

const nodes = [
  "InstitutionalLogicNode",
  "GovernanceModelNode",
  "CultureMechanismNode",
  "IncentiveStructureNode",
] as const;

export const OrganizationMechanicsEngine: AureliusGroupedEngine = {
  id: "OrganizationMechanicsEngine",
  nodes: [...nodes],
  runEngine: (input, state) => input.nodes.map((node) => runAureliusCompleteNode(node, state)),
};
