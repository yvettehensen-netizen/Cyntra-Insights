import type { BoardroomLayerId, BoardroomModuleId } from "./types";

export type BoardroomLayer = {
  id: BoardroomLayerId;
  label: string;
  modules: BoardroomModuleId[];
};

export const BOARDROOM_INTERVENTION_LAYERS: BoardroomLayer[] = [
  {
    id: "input_intelligence",
    label: "Input Intelligence",
    modules: [
      "ContextIngestionModule",
      "DataExtractionModule",
      "SignalDetectionModule",
      "StakeholderMapModule",
    ],
  },
  {
    id: "strategic_analysis",
    label: "Strategic Analysis",
    modules: [
      "PatternRecognitionModule",
      "CoreMechanismEngine",
      "StrategicParadoxEngine",
      "EcosystemStrategyEngine",
      "ReplicationLogicEngine",
      "StrategicThreatEngine",
    ],
  },
  {
    id: "decision_engine",
    label: "Decision Engine",
    modules: [
      "KillerInsightGenerator",
      "StrategyOptionGenerator",
      "TradeOffEngine",
      "DecisionEngine",
    ],
  },
  {
    id: "intervention_engine",
    label: "Intervention Engine",
    modules: [
      "InterventionGenerator",
      "KPIImpactModel",
      "ImplementationRoadmap",
      "RiskMitigationEngine",
    ],
  },
  {
    id: "boardroom_interface",
    label: "Boardroom Interface",
    modules: [
      "BlindSpotDetectorModule",
      "DecisionConsequenceModule",
      "StrategicLeverageModule",
      "StrategicMemoryModule",
      "BoardroomDebateModule",
      "BoardMemoGenerator",
      "BoardroomQuestionEngine",
    ],
  },
];

export const BOARDROOM_INTERVENTION_PIPELINE: BoardroomModuleId[] =
  BOARDROOM_INTERVENTION_LAYERS.flatMap((layer) => layer.modules);

const MODULE_DEPENDENCIES: Partial<Record<BoardroomModuleId, BoardroomModuleId[]>> =
  {
    DataExtractionModule: ["ContextIngestionModule"],
    SignalDetectionModule: ["DataExtractionModule"],
    StakeholderMapModule: ["SignalDetectionModule"],
    PatternRecognitionModule: ["SignalDetectionModule"],
    CoreMechanismEngine: ["PatternRecognitionModule"],
    StrategicParadoxEngine: ["CoreMechanismEngine"],
    EcosystemStrategyEngine: ["StakeholderMapModule", "StrategicParadoxEngine"],
    ReplicationLogicEngine: ["CoreMechanismEngine"],
    StrategicThreatEngine: ["StrategicParadoxEngine", "ReplicationLogicEngine"],
    KillerInsightGenerator: ["CoreMechanismEngine", "StrategicThreatEngine"],
    StrategyOptionGenerator: ["KillerInsightGenerator"],
    TradeOffEngine: ["StrategyOptionGenerator"],
    DecisionEngine: ["TradeOffEngine"],
    InterventionGenerator: ["DecisionEngine"],
    KPIImpactModel: ["InterventionGenerator"],
    ImplementationRoadmap: ["InterventionGenerator"],
    RiskMitigationEngine: ["ImplementationRoadmap", "StrategicThreatEngine"],
    BlindSpotDetectorModule: ["DecisionEngine", "RiskMitigationEngine"],
    DecisionConsequenceModule: ["BlindSpotDetectorModule", "DecisionEngine", "RiskMitigationEngine"],
    StrategicLeverageModule: ["BlindSpotDetectorModule", "DecisionConsequenceModule", "RiskMitigationEngine"],
    StrategicMemoryModule: ["StrategicLeverageModule", "DecisionConsequenceModule"],
    BoardroomDebateModule: ["StrategicMemoryModule", "DecisionConsequenceModule", "BlindSpotDetectorModule"],
    BoardMemoGenerator: [
      "DecisionEngine",
      "RiskMitigationEngine",
      "BlindSpotDetectorModule",
      "DecisionConsequenceModule",
      "StrategicLeverageModule",
      "StrategicMemoryModule",
      "BoardroomDebateModule",
    ],
    BoardroomQuestionEngine: ["BoardMemoGenerator", "TradeOffEngine"],
  };

export type BoardroomArchitectureValidation = {
  ok: boolean;
  moduleCount: number;
  errors: string[];
};

export function validateBoardroomInterventionArchitecture(): BoardroomArchitectureValidation {
  const errors: string[] = [];
  const pipeline = BOARDROOM_INTERVENTION_PIPELINE;
  const unique = new Set(pipeline);

  if (pipeline.length !== unique.size) {
    errors.push("pipeline_contains_duplicates");
  }
  if (pipeline.length !== 25) {
    errors.push(`unexpected_module_count:${pipeline.length}`);
  }

  const indexMap = new Map<BoardroomModuleId, number>();
  pipeline.forEach((module, index) => indexMap.set(module, index));
  for (const [module, dependencies] of Object.entries(MODULE_DEPENDENCIES) as Array<
    [BoardroomModuleId, BoardroomModuleId[]]
  >) {
    const moduleIndex = indexMap.get(module);
    if (moduleIndex == null) {
      errors.push(`missing_module:${module}`);
      continue;
    }
    for (const dependency of dependencies) {
      const dependencyIndex = indexMap.get(dependency);
      if (dependencyIndex == null) {
        errors.push(`missing_dependency:${module}->${dependency}`);
        continue;
      }
      if (dependencyIndex > moduleIndex) {
        errors.push(`dependency_order_violation:${module}->${dependency}`);
      }
    }
  }

  return { ok: errors.length === 0, moduleCount: pipeline.length, errors };
}
