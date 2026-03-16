import type { AureliusCompleteNodeId } from "@/aurelius/engine/complete/types";
import type { AureliusEngineId } from "@/aurelius/engine/engineTypes";
import {
  ContextEngine,
  ExecutionEngine,
  LearningEngine,
  NarrativeEngine,
  OrganizationMechanicsEngine,
  StrategicDecisionEngine,
  StrategicMechanismEngine,
  SystemAnalysisEngine,
  type AureliusGroupedEngine,
} from "@/aurelius/engine/engines";

export type AureliusEnginePipelineStep = {
  engine: AureliusEngineId;
  nodes: AureliusCompleteNodeId[];
};

export const engineRegistry: Record<AureliusEngineId, AureliusGroupedEngine> = {
  ContextEngine,
  OrganizationMechanicsEngine,
  SystemAnalysisEngine,
  StrategicMechanismEngine,
  StrategicDecisionEngine,
  ExecutionEngine,
  NarrativeEngine,
  LearningEngine,
};

export const AURELIUS_ENGINE_PIPELINE: AureliusEnginePipelineStep[] = [
  {
    engine: "ContextEngine",
    nodes: ["ContextEngine", "CaseClassificationNode", "SectorIntelligenceNode"],
  },
  {
    engine: "OrganizationMechanicsEngine",
    nodes: [
      "InstitutionalLogicNode",
      "GovernanceModelNode",
      "CultureMechanismNode",
      "IncentiveStructureNode",
    ],
  },
  {
    engine: "SystemAnalysisEngine",
    nodes: ["StructuralForcesNode", "SystemActorMappingNode", "PowerStructureNode", "EconomicEngineNode"],
  },
  {
    engine: "StrategicMechanismEngine",
    nodes: [
      "StrategicModeNode",
      "StrategicMechanismNode",
      "ConstraintNode",
      "StrategicPatternNode",
      "StrategicConflictNode",
      "OpportunityCostNode",
      "DecisionPressureNode",
      "StrategicLeverageNode",
      "SystemTransformationNode",
    ],
  },
  {
    engine: "StrategicDecisionEngine",
    nodes: [
      "DominantThesisNode",
      "StrategicOptionsNode",
      "TradeOffAnalysisNode",
      "ScenarioSimulationNode",
      "BoardDecisionNode",
    ],
  },
  {
    engine: "ExecutionEngine",
    nodes: [
      "InterventionArchitectureNode",
      "InterventionPrioritizationNode",
      "ExecutionRiskNode",
      "KPIArchitectureNode",
      "DecisionContractNode",
    ],
  },
  {
    engine: "NarrativeEngine",
    nodes: [
      "NarrativeCompressionNode",
      "BoardMemoNode",
      "InsightGenerationNode",
      "LanguageDisciplineNode",
      "NarrativeGenerator",
    ],
  },
  {
    engine: "LearningEngine",
    nodes: ["StrategicMemoryNode", "CaseSimilarityNode", "InsightRefinementNode"],
  },
];
