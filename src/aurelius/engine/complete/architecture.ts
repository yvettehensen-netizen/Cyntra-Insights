import type { AureliusCompleteNodeId, AureliusLayerId } from "./types";

export type AureliusLayer = {
  id: AureliusLayerId;
  label: string;
  nodes: AureliusCompleteNodeId[];
};

export const AURELIUS_COMPLETE_LAYERS: AureliusLayer[] = [
  {
    id: "contextbegrip",
    label: "Contextbegrip",
    nodes: ["ContextEngine", "CaseClassificationNode", "SectorIntelligenceNode"],
  },
  {
    id: "organization_dna",
    label: "Organization DNA",
    nodes: [
      "InstitutionalLogicNode",
      "GovernanceModelNode",
      "CultureMechanismNode",
      "IncentiveStructureNode",
    ],
  },
  {
    id: "systeemanalyse",
    label: "Systeemanalyse",
    nodes: [
      "StructuralForcesNode",
      "SystemActorMappingNode",
      "PowerStructureNode",
      "EconomicEngineNode",
      "StrategicModeNode",
      "StrategicMechanismNode",
      "ConstraintNode",
    ],
  },
  {
    id: "strategisch_conflict",
    label: "Strategische intelligentie",
    nodes: [
      "StrategicPatternNode",
      "StrategicConflictNode",
      "OpportunityCostNode",
      "DecisionPressureNode",
      "StrategicLeverageNode",
      "SystemTransformationNode",
    ],
  },
  {
    id: "besluitvorming",
    label: "Strategische besluitvorming",
    nodes: [
      "DominantThesisNode",
      "StrategicOptionsNode",
      "TradeOffAnalysisNode",
      "ScenarioSimulationNode",
      "BoardDecisionNode",
    ],
  },
  {
    id: "interventiearchitectuur",
    label: "Interventiearchitectuur",
    nodes: [
      "InterventionArchitectureNode",
      "InterventionPrioritizationNode",
      "ExecutionRiskNode",
      "KPIArchitectureNode",
      "DecisionContractNode",
    ],
  },
  {
    id: "narrative_engine",
    label: "Narrative engine",
    nodes: [
      "NarrativeCompressionNode",
      "BoardMemoNode",
      "InsightGenerationNode",
      "LanguageDisciplineNode",
      "NarrativeGenerator",
    ],
  },
  {
    id: "learning",
    label: "Learning",
    nodes: ["StrategicMemoryNode", "CaseSimilarityNode", "InsightRefinementNode"],
  },
];

export const AURELIUS_COMPLETE_PIPELINE: AureliusCompleteNodeId[] = AURELIUS_COMPLETE_LAYERS.flatMap(
  (layer) => layer.nodes
);

const NODE_DEPENDENCIES: Partial<Record<AureliusCompleteNodeId, AureliusCompleteNodeId[]>> = {
  CaseClassificationNode: ["ContextEngine"],
  SectorIntelligenceNode: ["ContextEngine"],
  InstitutionalLogicNode: ["CaseClassificationNode"],
  GovernanceModelNode: ["InstitutionalLogicNode"],
  CultureMechanismNode: ["InstitutionalLogicNode"],
  IncentiveStructureNode: ["CultureMechanismNode"],
  StructuralForcesNode: ["SectorIntelligenceNode"],
  SystemActorMappingNode: ["StructuralForcesNode"],
  PowerStructureNode: ["SystemActorMappingNode"],
  EconomicEngineNode: ["StructuralForcesNode"],
  StrategicModeNode: ["EconomicEngineNode"],
  StrategicMechanismNode: ["SystemActorMappingNode", "IncentiveStructureNode", "EconomicEngineNode"],
  ConstraintNode: ["StrategicMechanismNode"],
  StrategicPatternNode: ["StrategicMechanismNode"],
  StrategicConflictNode: ["StrategicPatternNode", "ConstraintNode"],
  OpportunityCostNode: ["StrategicConflictNode"],
  DecisionPressureNode: ["OpportunityCostNode"],
  StrategicLeverageNode: ["StrategicConflictNode", "StrategicMechanismNode"],
  SystemTransformationNode: ["StrategicLeverageNode", "PowerStructureNode"],
  DominantThesisNode: ["StrategicConflictNode", "SystemTransformationNode"],
  StrategicOptionsNode: ["DominantThesisNode"],
  TradeOffAnalysisNode: ["StrategicOptionsNode"],
  ScenarioSimulationNode: ["TradeOffAnalysisNode"],
  BoardDecisionNode: ["ScenarioSimulationNode", "DecisionPressureNode"],
  InterventionArchitectureNode: ["BoardDecisionNode", "StrategicLeverageNode"],
  InterventionPrioritizationNode: ["InterventionArchitectureNode"],
  ExecutionRiskNode: ["InterventionPrioritizationNode"],
  KPIArchitectureNode: ["InterventionPrioritizationNode"],
  DecisionContractNode: ["BoardDecisionNode", "KPIArchitectureNode"],
  NarrativeCompressionNode: ["DecisionContractNode"],
  BoardMemoNode: ["NarrativeCompressionNode"],
  InsightGenerationNode: ["BoardMemoNode"],
  LanguageDisciplineNode: ["InsightGenerationNode"],
  NarrativeGenerator: ["LanguageDisciplineNode"],
  StrategicMemoryNode: ["NarrativeGenerator"],
  CaseSimilarityNode: ["StrategicMemoryNode"],
  InsightRefinementNode: ["CaseSimilarityNode"],
};

export type ArchitectureValidation = {
  ok: boolean;
  nodeCount: number;
  errors: string[];
};

export function validateCompleteArchitecture(): ArchitectureValidation {
  const errors: string[] = [];
  const nodes = AURELIUS_COMPLETE_PIPELINE;
  const unique = new Set(nodes);
  if (nodes.length !== unique.size) {
    errors.push("pipeline_contains_duplicates");
  }
  if (nodes.length !== 38) {
    errors.push(`unexpected_node_count:${nodes.length}`);
  }

  const indexMap = new Map<AureliusCompleteNodeId, number>();
  nodes.forEach((node, index) => indexMap.set(node, index));
  for (const [node, deps] of Object.entries(NODE_DEPENDENCIES) as Array<
    [AureliusCompleteNodeId, AureliusCompleteNodeId[]]
  >) {
    const nodeIndex = indexMap.get(node);
    if (nodeIndex == null) {
      errors.push(`missing_node:${node}`);
      continue;
    }
    for (const dep of deps) {
      const depIndex = indexMap.get(dep);
      if (depIndex == null) errors.push(`missing_dependency:${node}->${dep}`);
      if (depIndex != null && depIndex > nodeIndex) {
        errors.push(`dependency_order_violation:${node}->${dep}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    nodeCount: nodes.length,
    errors,
  };
}

