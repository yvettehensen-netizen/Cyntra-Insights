export type BoardroomLayerId =
  | "input_intelligence"
  | "strategic_analysis"
  | "decision_engine"
  | "intervention_engine"
  | "boardroom_interface";

export type BoardroomModuleId =
  | "ContextIngestionModule"
  | "DataExtractionModule"
  | "SignalDetectionModule"
  | "StakeholderMapModule"
  | "PatternRecognitionModule"
  | "CoreMechanismEngine"
  | "StrategicParadoxEngine"
  | "EcosystemStrategyEngine"
  | "ReplicationLogicEngine"
  | "StrategicThreatEngine"
  | "KillerInsightGenerator"
  | "StrategyOptionGenerator"
  | "TradeOffEngine"
  | "DecisionEngine"
  | "InterventionGenerator"
  | "KPIImpactModel"
  | "ImplementationRoadmap"
  | "RiskMitigationEngine"
  | "BlindSpotDetectorModule"
  | "DecisionConsequenceModule"
  | "StrategicLeverageModule"
  | "StrategicMemoryModule"
  | "BoardroomDebateModule"
  | "BoardMemoGenerator"
  | "BoardroomQuestionEngine";

export type BoardroomModuleOutput = {
  module: BoardroomModuleId;
  summary: string;
  data: Record<string, unknown>;
  confidence: number;
};

export type BoardroomPipelineState = {
  inputText: string;
  organizationName?: string;
  sector?: string;
  outputs: Partial<Record<BoardroomModuleId, BoardroomModuleOutput>>;
  trace: BoardroomModuleId[];
  warnings: string[];
};

export type BoardroomModuleProcessor = (
  state: BoardroomPipelineState
) => BoardroomModuleOutput;
