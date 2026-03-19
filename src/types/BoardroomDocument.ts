export type BoardroomMetaDocument = {
  organizationName: string;
  sector: string;
  reportId: string;
  analysisDate: string;
};

export type BoardroomScenarioDocument = {
  title: string;
  mechanism: string;
  risk: string;
  governanceImplication: string;
  impactScore?: number;
  riskScore?: number;
  executionScore?: number;
};

export type BoardroomActionDocument = {
  action: string;
  owner: string;
  deadline: string;
  kpi: string;
};

export type BoardroomExecutiveDecisionCardDocument = {
  summary: string;
  decisionQuestion: string;
};

export type BoardroomInsightDocument = {
  insight: string;
  whyItMatters: string;
  governanceConsequence: string;
};

export type BoardroomDecisionIntelligence = {
  thesis: string;
  tradeOff: string;
  inevitability: string;
  breakpoints: string[];
  forcedDecision: string;
  errors: string[];
};

export interface BoardroomDocument {
  meta: BoardroomMetaDocument;
  executiveDecisionCard: BoardroomExecutiveDecisionCardDocument;
  strategicSituation: string;
  strategicTension: string;
  mechanismAnalysis: string;
  scenarioComparison: string;
  breakthroughInsights: string;
  governanceImplications: string;
  boardActionPlan: string;
  stopRules: string;
  stopRuleItems: string[];
  scenarioCards: BoardroomScenarioDocument[];
  recommendedScenario?: BoardroomScenarioDocument;
  actionItems: BoardroomActionDocument[];
  insightItems: BoardroomInsightDocument[];
  decision: BoardroomDecisionIntelligence;
}
