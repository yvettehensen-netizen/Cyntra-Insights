// ============================================================
// src/aurelius/orchestrator/charter/types.ts
// CYNTRA LEARNING CHARTER — CANON TYPES
// ============================================================

export type LearningDomain =
  | "structure"
  | "signals"
  | "constraints"
  | "patterns"
  | "risk_dynamics"
  | "decision_tradeoffs";

export type ForbiddenLearning =
  | "normative_preference"
  | "political_alignment"
  | "moral_judgement"
  | "ideological_scoring"
  | "emotional_attachment"
  | "self_directed_goals";

export interface CyntraLearningItem {
  domain: LearningDomain;
  insight: string;

  source_analysis: string;
  extracted_from: string;

  confidence: number; // 0–1
}

export interface CyntraLearningCharter {
  allowed_domains: readonly LearningDomain[];
  forbidden_domains: readonly ForbiddenLearning[];

  principle: string;
  canonical_warning: string;
}
