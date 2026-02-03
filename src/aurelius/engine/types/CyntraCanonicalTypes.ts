// ============================================================
// src/aurelius/types/CyntraCanonicalTypes.ts
// CYNTRA TYPES — OMNIPOTENT CANONICAL BARREL
// ============================================================

/* ============================================================
   ANALYSIS IDENTIFIERS
============================================================ */

export type CyntraAnalysisType =
  | "strategy"
  | "finance"
  | "financial_strategy"
  | "growth"
  | "market"
  | "process"
  | "leadership"
  | "team_culture"
  | "team_dynamics"
  | "change_resilience"
  | "onderstroom"
  | "esg"
  | "ai_data"
  | "marketing"
  | "sales"
  | "swot"
  | "custom"
  | "innovation"
  | "risk_management"
  | "sustainability"
  | "digital_transformation"
  | "customer_experience"
  | "supply_chain"
  | "hr_talent"
  | "competitive_analysis"
  | "scenario_planning";

/* ============================================================
   PRIORITY & DEPTH
============================================================ */

export type CyntraPriority =
  | "critical"
  | "high"
  | "standard"
  | "low";

export type CyntraDepth =
  | "executive"
  | "boardroom"
  | "strategic"
  | "operational"
  | "tactical"
  | "full";

/* ============================================================
   CORE CONTEXT
============================================================ */

export interface CyntraAnalysisContext {
  companyName?: string;
  rawText?: string;
  documents?: string[];
  userContext?: Record<string, unknown>;
  externalData?: Record<string, unknown>;
  historicalContext?: string[];

  stakeholderMap?: Record<string, string[]>;
  geographicScope?: string[];
  industryBenchmarks?: Record<string, number>;
  regulatoryCompliance?: string[];
  techStack?: string[];
  customMetrics?: Record<string, number>;
  priorityLevel?: CyntraPriority;
}

/* ============================================================
   EXECUTION ROADMAP — 180 DAYS
============================================================ */

export interface CyntraRoadmap180D {
  month1?: string[];
  month2?: string[];
  month3?: string[];
  month4?: string[];
  month5?: string[];
  month6?: string[];

  metrics?: string[];
  owners?: string[];

  dependencies?: string[];
  risks?: string[];
  contingencies?: string[];
  budgetAllocations?: Record<string, number>;
}

/* ============================================================
   ATOMIC MODEL OUTPUT
============================================================ */

export interface CyntraModelResult {
  model: string;

  executive_thesis?: string;
  central_tension?: string;

  insights?: string[];
  strengths?: string[];
  weaknesses?: string[];
  risks?: string[];
  opportunities?: string[];

  recommendations?: string[];
  roadmap_180d?: CyntraRoadmap180D;

  confidence: number;
  urgency?: string;
  score?: number;

  metadata?: Record<string, unknown>;

  counterarguments?: string[];
  scenarios?: Record<string, string[]>;
  impactForecast?: Record<string, number>;
  resourceRequirements?: string[];
  stakeholderImpact?: Record<string, string>;
  innovationIndex?: number;
  sustainabilityScore?: number;
}

/* ============================================================
   FINAL SYNTHESIS
============================================================ */

export interface CyntraAnalysisResult {
  title?: string;

  executive_thesis: string;
  central_tension: string;

  executive_summary?: string;

  insights: string[];
  strengths?: string[];
  weaknesses?: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];

  roadmap_180d?: CyntraRoadmap180D;

  confidence: number;
  urgency?: string;
  score?: number;

  metadata?: Record<string, unknown>;

  counterarguments?: string[];
  scenarios?: Record<string, string[]>;
  impactForecast?: Record<string, number>;
  resourceRequirements?: string[];
  stakeholderImpact?: Record<string, string>;
  innovationIndex?: number;
  sustainabilityScore?: number;
  optimizationRecommendations?: string[];
  competitiveEdgeAnalysis?: string[];
  exitStrategies?: string[];
}

/* ============================================================
   REQUEST / EXECUTION CONTRACT
============================================================ */

export interface CyntraRunInput {
  analysis_type: CyntraAnalysisType;
  company_context: string;

  document_data?: string | undefined;

  depth?: CyntraDepth;
  priority?: CyntraPriority;

  min_words?: number;
  max_words?: number;

  include_scenarios?: boolean;
  include_metrics?: boolean;
  include_counterarguments?: boolean;
  include_visuals?: boolean;
  force_longform?: boolean;

  cache_ttl?: number;
  custom_instructions?: string;

  enable_streaming?: boolean;
  onProgress?: (progress: number, partialReport: string) => void;
}

/* ============================================================
   EXECUTION RESULT CONTRACT
============================================================ */

export interface CyntraRunResult {
  id?: string;
  report?: string;

  metadata?: {
    confidence: "high" | "medium" | "low";
    processing_time: number;
    word_count: number;
    depth_applied: CyntraDepth;
    priority_applied: CyntraPriority;
    visuals_included: boolean;
    stream_processed: boolean;
  };
}
