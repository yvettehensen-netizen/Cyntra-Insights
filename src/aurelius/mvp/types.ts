export type MvpDecisionOptionCode = "A" | "B" | "C";

export type SignalExtractionOutput = {
  facts: string[];
  tensions: string[];
  patterns: string[];
  anomalies: string[];
};

export type StrategicConflictOutput = {
  conflict: string;
  sideA: string;
  sideB: string;
  mechanism: string;
  boardQuestion: string;
};

export type KillerInsightOutput = {
  insight: string;
  mechanism: string;
  implication: string;
};

export type InterventionItem = {
  title: string;
  leverage: "capaciteit" | "kennis" | "macht" | "netwerk" | "standaardisatie";
  action: string;
  goal: string;
  risk: string;
};

export type InterventionEngineOutput = {
  interventions: InterventionItem[];
};

export type DecisionOption = {
  code: MvpDecisionOptionCode;
  label: string;
  mechanism: string;
  upside: string;
  downside: string;
};

export type BoardMemoOutput = {
  executiveSummary: string;
  bestuurlijkeHypothese: string;
  kernconflict: string;
  killerInsight: string;
  besluitopties: DecisionOption[];
  interventions: InterventionItem[];
  openQuestions: string[];
  memoText: string;
};

export type AureliusMvpResult = {
  signalExtraction: SignalExtractionOutput;
  strategicConflict: StrategicConflictOutput;
  killerInsight: KillerInsightOutput;
  interventionEngine: InterventionEngineOutput;
  boardMemo: BoardMemoOutput;
};

