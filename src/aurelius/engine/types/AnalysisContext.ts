export interface AnalysisContext {
  analysisType: string;

  companyName?: string;
  rawText: string;

  documents?: string[];
  userContext?: Record<string, unknown>;
  externalData?: Record<string, unknown>;
  historicalContext?: string[];

  brutalMode: boolean;
}
