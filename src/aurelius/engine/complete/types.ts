import type { AureliusEngineTraceEntry } from "@/aurelius/engine/engineTypes";

export type AureliusLayerId =
  | "contextbegrip"
  | "organization_dna"
  | "systeemanalyse"
  | "strategisch_conflict"
  | "besluitvorming"
  | "interventiearchitectuur"
  | "narrative_engine"
  | "learning";

export type AureliusCompleteNodeId =
  | "ContextEngine"
  | "CaseClassificationNode"
  | "SectorIntelligenceNode"
  | "InstitutionalLogicNode"
  | "GovernanceModelNode"
  | "CultureMechanismNode"
  | "IncentiveStructureNode"
  | "StructuralForcesNode"
  | "SystemActorMappingNode"
  | "PowerStructureNode"
  | "EconomicEngineNode"
  | "StrategicModeNode"
  | "StrategicMechanismNode"
  | "ConstraintNode"
  | "StrategicPatternNode"
  | "StrategicConflictNode"
  | "OpportunityCostNode"
  | "DecisionPressureNode"
  | "StrategicLeverageNode"
  | "SystemTransformationNode"
  | "DominantThesisNode"
  | "StrategicOptionsNode"
  | "TradeOffAnalysisNode"
  | "ScenarioSimulationNode"
  | "BoardDecisionNode"
  | "InterventionArchitectureNode"
  | "InterventionPrioritizationNode"
  | "ExecutionRiskNode"
  | "KPIArchitectureNode"
  | "DecisionContractNode"
  | "NarrativeCompressionNode"
  | "BoardMemoNode"
  | "InsightGenerationNode"
  | "LanguageDisciplineNode"
  | "NarrativeGenerator"
  | "StrategicMemoryNode"
  | "CaseSimilarityNode"
  | "InsightRefinementNode";

export type AureliusNodeOutput = {
  node: AureliusCompleteNodeId;
  summary: string;
  data: Record<string, unknown>;
  confidence: number;
};

export type AureliusPipelineState = {
  inputText: string;
  organizationName?: string;
  sector?: string;
  outputs: Partial<Record<AureliusCompleteNodeId, AureliusNodeOutput>>;
  trace: AureliusCompleteNodeId[];
  engineTrace: AureliusEngineTraceEntry[];
  warnings: string[];
};

export type AureliusNodeProcessor = (state: AureliusPipelineState) => AureliusNodeOutput;
