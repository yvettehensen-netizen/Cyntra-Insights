export type AureliusEngineId =
  | "ContextEngine"
  | "OrganizationMechanicsEngine"
  | "SystemAnalysisEngine"
  | "StrategicMechanismEngine"
  | "StrategicDecisionEngine"
  | "ExecutionEngine"
  | "NarrativeEngine"
  | "LearningEngine";

export type AureliusEngineTraceEntry = {
  engine: AureliusEngineId;
  timestamp: number;
  nodesExecuted: string[];
};
