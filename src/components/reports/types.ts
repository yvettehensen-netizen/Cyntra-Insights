export type ReportTabKey = "boardroom" | "strategy" | "scenario" | "engine";
export type ReportSpeedMode = "short" | "full";

export type ReportSection = {
  title: string;
  body: string;
};

export type BoardIntervention = {
  title: string;
  mechanism?: string;
  kpi?: string;
};

export type StructuredKillerInsight = {
  insight: string;
  mechanism: string;
  implication: string;
};

export type GovernanceIntervention = {
  action: string;
  mechanism: string;
  boardDecision: string;
  owner: string;
  deadline: string;
  kpi: string;
};

export type CompactScenario = {
  title: string;
  mechanism: string;
  risk: string;
  boardImplication: string;
};

export type OptionRejection = {
  optionLabel: string;
  rationale: string;
};

export type BoardDecisionPressure = {
  operational: string;
  financial: string;
  organizational: string;
};

export type BestuurlijkeBesliskaart = {
  organization: string;
  sector: string;
  analysisDate: string;
  coreProblem: string;
  coreStatement: string;
  recommendedChoice: string;
  whyReasons: string[];
  riskIfDelayed: string;
  stopRules: string[];
};

export type ReportViewModel = {
  organizationName: string;
  sessionId: string;
  createdAt: string;
  sector: string;
  deckSubtitle: string;
  contactLines: string[];
  qualityScore: number;
  qualityTier: string;
  dominantThesis: string;
  strategicConflict: string;
  boardOptions: string[];
  recommendedDirection: string;
  topInterventions: BoardIntervention[];
  structuredKillerInsights: StructuredKillerInsight[];
  governanceInterventions: GovernanceIntervention[];
  compactScenarios: CompactScenario[];
  optionRejections: OptionRejection[];
  boardDecisionPressure: BoardDecisionPressure;
  boardQuestion: string;
  financialConsequences: string;
  stressTest: string;
  executiveSummary: string;
  strategyAlert: string;
  noIntervention: string;
  strategySections: ReportSection[];
  scenarioSections: ReportSection[];
  engineSections: ReportSection[];
  qualityLevel: "hoog" | "middel" | "laag";
  qualityChecks: string[];
  criticalFlags: string[];
  nonCriticalFlags: string[];
  bestuurlijkeBesliskaart: BestuurlijkeBesliskaart;
};
