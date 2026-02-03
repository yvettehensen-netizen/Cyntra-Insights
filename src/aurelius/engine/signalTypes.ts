// ============================================================
// src/aurelius/engine/signalTypes.ts
// ============================================================

import type { ConfidenceLevel } from "../types";

export type NLPSignalType =
  | "agency_diffusion"
  | "authority_shift"
  | "decision_avoidance"
  | "contradiction"
  | "informal_power"
  | "topic_suppression";

export interface NLPSignal {
  type: NLPSignalType;
  description: string;
  evidence: string[];
  confidence: ConfidenceLevel;
}
