export interface StrategicScenarioMapItem {
  name: string;
  mechanism: string;
  risk: string;
  governanceImplication: string;
}

export interface StrategicInterventionMapItem {
  action: string;
  reason: string;
  risk: string;
  stopRule: string;
  owner?: string;
  deadline?: string;
  KPI?: string;
}

export interface StrategicFailurePoint {
  mechanism: string;
  systemPressure: string;
  risk: string;
  boardTest: string;
}

export interface StrategicSystemMechanism {
  symptom: string;
  cause: string;
  mechanism: string;
  consequence: string;
  systemPressure: string;
  boardImplication: string;
}

export interface StrategicQuestionMap {
  raisonDetre: string;
  powerStructure: string;
  bottleneck: string;
  failurePoint: string;
  boardDecision: string;
}

export interface StrategicPatternMap {
  primaryPattern: string;
  secondaryPattern: string;
  mechanism: string;
  rationale: string;
  dominantRisk: string;
}

export interface BoardroomRedFlagMapItem {
  category: string;
  description: string;
  mechanism: string;
  boardQuestion: string;
}

export interface StrategicAnalysisMap {
  organisation: string;
  sector: string;
  analysisDate: string;
  dominantRisk: string;
  strategicTension: {
    optionA: string;
    optionB: string;
  };
  decisionOptions: string[];
  recommendedOption: string;
  strategyChallenge?: {
    currentStrategy: string;
    externalPressure: string;
    breakScenario: string;
    requiredCondition: string;
  };
  strategicFailurePoints?: StrategicFailurePoint[];
  systemMechanism?: StrategicSystemMechanism;
  strategicQuestions?: StrategicQuestionMap;
  strategicPattern?: StrategicPatternMap;
  boardroomRedFlags?: BoardroomRedFlagMapItem[];
  memoryInsights?: {
    historicalOutcome: string;
    patternMatchScore: number;
    dominantRecommendation?: string;
    rankedRecommendations: Array<{
      recommendation: string;
      weightedScore: number;
      supportCount: number;
      averageOutcomeScore: number;
      sectorMatch: boolean;
      evidenceCaseIds: string[];
    }>;
  };
  scenarios: StrategicScenarioMapItem[];
  interventions: StrategicInterventionMapItem[];
}
