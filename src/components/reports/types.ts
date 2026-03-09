export type ReportTabKey = "boardroom" | "strategy" | "engine";

export type ReportSection = {
  title: string;
  body: string;
};

export type BoardIntervention = {
  title: string;
  mechanism?: string;
  kpi?: string;
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
  boardQuestion: string;
  executiveSummary: string;
  strategyAlert: string;
  noIntervention: string;
  strategySections: ReportSection[];
  engineSections: ReportSection[];
  qualityLevel: "hoog" | "middel" | "laag";
  qualityChecks: string[];
  criticalFlags: string[];
  nonCriticalFlags: string[];
};
