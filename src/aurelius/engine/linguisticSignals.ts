// ============================================================
// src/aurelius/engine/linguisticSignals.ts
// CANONICAL NLP SIGNAL LAYER — CYNTRA (ADD-ONLY • STABLE)
// ============================================================

/* --------------------------------------------
   CONFIDENCE LEVEL
--------------------------------------------- */
export type SignalConfidence = "low" | "medium" | "high";

/* --------------------------------------------
   SIGNAL TYPES (EXTENSIBLE, NO BREAKING)
--------------------------------------------- */
export type LinguisticSignalType =
  | "avoidance"
  | "authority_shift"
  | "emotional_charge"
  | "contradiction"
  | "agency_diffusion"
  | "power_signal"
  | "uncertainty_marker"
  | "deflection"
  | "responsibility_blur"
  | "implicit_alignment"
  | "implicit_conflict"
  | "risk_language"
  | "control_language"
  | "dependency_signal";

/* --------------------------------------------
   CORE SIGNAL STRUCTURE
--------------------------------------------- */
export interface LinguisticSignal {
  type: LinguisticSignalType;
  evidence: string[];
  confidence: SignalConfidence;
  source?: "context" | "document" | "conversation";
  span?: { start: number; end: number };
}

/* --------------------------------------------
   GROUPED SIGNAL OUTPUT
--------------------------------------------- */
export interface LinguisticSignalBundle {
  signals: LinguisticSignal[];
  generated_at: string;
  version: "1.0";
}

/* --------------------------------------------
   SAFE EMPTY DEFAULT
--------------------------------------------- */
export const EMPTY_LINGUISTIC_SIGNAL_BUNDLE: LinguisticSignalBundle = {
  signals: [],
  generated_at: new Date().toISOString(),
  version: "1.0",
};

/* --------------------------------------------
   TYPE GUARDS
--------------------------------------------- */
export function isLinguisticSignal(
  input: unknown
): input is LinguisticSignal {
  if (!input || typeof input !== "object") return false;
  const s = input as LinguisticSignal;

  return (
    typeof s.type === "string" &&
    Array.isArray(s.evidence) &&
    (s.confidence === "low" ||
      s.confidence === "medium" ||
      s.confidence === "high")
  );
}

export function isLinguisticSignalBundle(
  input: unknown
): input is LinguisticSignalBundle {
  if (!input || typeof input !== "object") return false;
  const b = input as LinguisticSignalBundle;

  return (
    Array.isArray(b.signals) &&
    typeof b.generated_at === "string" &&
    b.version === "1.0"
  );
}

/* --------------------------------------------
   NORMALIZER (DEFENSIVE)
--------------------------------------------- */
export function normalizeLinguisticSignals(
  input: unknown
): LinguisticSignal[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isLinguisticSignal);
}
