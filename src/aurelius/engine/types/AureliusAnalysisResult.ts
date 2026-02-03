export interface Roadmap90D {
  month1?: string[];
  month2?: string[];
  month3?: string[];
  metrics?: string[];
  owners?: string[];
}

export interface AureliusAnalysisResult {
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

  roadmap_90d?: Roadmap90D;

  confidence: number;
  urgency?: string;
  score?: number;

  metadata?: Record<string, unknown>;
}
