// ============================================================
// src/aurelius/orchestrator/charter/charter.ts
// ORCHESTRATOR LEARNING CHARTER — CANON LAW
// ============================================================

import type { CyntraLearningCharter } from "./types";

export const ORCHESTRATOR_CHARTER: CyntraLearningCharter = {
  allowed_domains: [
    "structure",
    "signals",
    "constraints",
    "patterns",
    "risk_dynamics",
    "decision_tradeoffs",
  ],

  forbidden_domains: [
    "normative_preference",
    "political_alignment",
    "moral_judgement",
    "ideological_scoring",
    "emotional_attachment",
    "self_directed_goals",
  ],

  principle:
    "Cyntra is an epistemic instrument. It may sharpen structure, never develop preference.",

  canonical_warning:
    "Any learning that implies steering, judging, or normativity must be rejected instantly.",
};
