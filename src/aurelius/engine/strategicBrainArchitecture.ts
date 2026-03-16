export type StrategicBrainLayerId =
  | "perception"
  | "pattern"
  | "learning"
  | "reasoning"
  | "decision"
  | "boardroom"
  | "narrative"
  | "board_output";

export type StrategicBrainNodeId =
  | "ContextEngine"
  | "StrategicSignalDetectionNode"
  | "OrganizationMechanicsEngine"
  | "SystemAnalysisEngine"
  | "StrategicPatternDetectionNode"
  | "StrategicMemoryNode"
  | "StrategicParadoxNode"
  | "ParadoxQualityCheckNode"
  | "UncomfortableTruthNode"
  | "KillerInsightNode"
  | "StrategicOptionsNode"
  | "BoardDecisionNode"
  | "BoardroomRoleDebateNode"
  | "StrategicPressureTestNode"
  | "StrategicNarrativeNode"
  | "BoardDecisionBriefNode";

export type StrategicBrainLayer = {
  id: StrategicBrainLayerId;
  label: string;
  nodes: StrategicBrainNodeId[];
};

export const STRATEGIC_BRAIN_LAYERS: StrategicBrainLayer[] = [
  {
    id: "perception",
    label: "Perception Layer",
    nodes: ["ContextEngine", "StrategicSignalDetectionNode", "OrganizationMechanicsEngine", "SystemAnalysisEngine"],
  },
  {
    id: "pattern",
    label: "Pattern Layer",
    nodes: ["StrategicPatternDetectionNode"],
  },
  {
    id: "learning",
    label: "Learning Layer",
    nodes: ["StrategicMemoryNode"],
  },
  {
    id: "reasoning",
    label: "Reasoning Layer",
    nodes: [
      "StrategicParadoxNode",
      "ParadoxQualityCheckNode",
      "UncomfortableTruthNode",
      "KillerInsightNode",
    ],
  },
  {
    id: "decision",
    label: "Decision Layer",
    nodes: ["StrategicOptionsNode", "BoardDecisionNode"],
  },
  {
    id: "boardroom",
    label: "Boardroom Layer",
    nodes: ["BoardroomRoleDebateNode", "StrategicPressureTestNode"],
  },
  {
    id: "narrative",
    label: "Narrative Layer",
    nodes: ["StrategicNarrativeNode"],
  },
  {
    id: "board_output",
    label: "Board Output Layer",
    nodes: ["BoardDecisionBriefNode"],
  },
];

export const STRATEGIC_BRAIN_ARCHITECTURE = STRATEGIC_BRAIN_LAYERS.flatMap((layer) => layer.nodes);

export const STRATEGIC_BRAIN_ARCHITECTURE_AFTER_DECISION = [
  "BoardroomRoleDebateNode",
  "StrategicPressureTestNode",
  "StrategicNarrativeNode",
  "BoardDecisionBriefNode",
] as const satisfies readonly StrategicBrainNodeId[];
