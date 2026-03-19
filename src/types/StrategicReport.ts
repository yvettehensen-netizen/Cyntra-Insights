export interface StrategicReport {
  meta: {
    organisation: string;
    sector: string;
    reportId: string;
    analysisDate: string;
  };

  executiveCore: string;

  decisionQuestion: string;

  situation: string;

  strategicTension: {
    axisA: string;
    axisB: string;
    explanation: string;
  };

  mechanismAnalysis: {
    coreMechanism?: string;
    explanation: string;
    causalChain: string[];
    boardInterpretation?: string;
  };

  scenarios: {
    title: string;
    mechanism: string;
    risk: string;
    governanceImplication: string;
    impactScore?: number;
    riskScore?: number;
    executionScore?: number;
    impact?: number;
    execution?: number;
  }[];

  breakthroughInsights?: {
    insight: string;
    whyItMatters: string;
    governanceConsequence: string;
  }[];

  insights: {
    insight: string;
    whyItMatters: string;
    governanceConsequence: string;
  }[];

  governanceImplications: {
    strategicImpact: string;
    governanceQuestion: string;
    decisionMoment: string;
  }[];

  boardActions?: {
    action: string;
    owner: string;
    deadline: string;
    kpi: string;
  }[];

  actions: {
    action: string;
    owner: string;
    deadline: string;
    kpi: string;
  }[];

  stopRules: string[];
}
