// ============================================================
// src/aurelius/engine/nodes/power/ConflictNode.schema.ts
// CONFLICT NODE RESULT SCHEMA — FAIL-SAFE NORMALIZER
// ADD ONLY
// ============================================================

import { z } from "zod";
import type { ModelResult } from "@/aurelius/engine/types";

const conflictDecisionSignalsSchema = z
  .object({
    has_clear_decision: z.boolean().optional(),
    tradeoffs_identified: z.boolean().optional(),
    irreversible_choices_present: z.boolean().optional(),
    ownership_assigned: z.boolean().optional(),
    decision_urgency: z
      .enum(["low", "medium", "high", "existential"])
      .optional(),
  })
  .partial();

const conflictMetadataSchema = z
  .object({
    lens: z.string().optional(),
    version: z.string().optional(),
    upgrade_policy: z.string().optional(),
    conflict_detected: z.boolean().optional(),
    tension_intensity_score: z.number().optional(),
    conflict_intensity_score_0_100: z.number().optional(),
    detected_signals: z.array(z.string()).optional(),
    negation_hit: z.boolean().optional(),
    dominant_tensions: z.array(z.string()).optional(),
    conflict_summary: z.string().optional(),
    weighted_signals: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          hits: z.number(),
          weight: z.number(),
          score: z.number(),
        })
      )
      .optional(),
    raw_score: z.number().optional(),
    normalized_score: z.number().optional(),
    text_length: z.number().optional(),
  })
  .passthrough();

export const conflictNodeResultSchema = z
  .object({
    section: z.literal("power_conflict"),
    model: z.literal("ConflictNode"),
    insights: z.array(z.string()),
    risks: z.array(z.string()),
    opportunities: z.array(z.string()),
    recommendations: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    decision_signals: conflictDecisionSignalsSchema.optional(),
    metadata: conflictMetadataSchema.optional(),
  })
  .passthrough();

export type ConflictNodeResult = z.infer<
  typeof conflictNodeResultSchema
>;

const CONFLICT_NODE_FALLBACK: ConflictNodeResult = {
  section: "power_conflict",
  model: "ConflictNode",
  insights: [
    "Conflict-analyse fallback geactiveerd zodat de renderer nooit zonder output valt.",
  ],
  risks: [
    "Conflict-signalen konden niet volledig worden gevalideerd; gebruik handmatige boardroom check.",
  ],
  opportunities: [],
  recommendations: [
    "Forceer één expliciete keuzeconflict, eigenaar en deadline om besluitvorming te stabiliseren.",
  ],
  confidence: 0.75,
  decision_signals: {
    has_clear_decision: false,
    tradeoffs_identified: false,
    irreversible_choices_present: false,
    ownership_assigned: false,
    decision_urgency: "medium",
  },
  metadata: {
    lens: "conflict_detection",
    version: "2026.5",
    upgrade_policy: "add_only",
    conflict_detected: false,
    tension_intensity_score: 0,
    conflict_intensity_score_0_100: 0,
    detected_signals: [],
    negation_hit: false,
    dominant_tensions: [],
    conflict_summary: "Fallback conflict-summary toegepast.",
    weighted_signals: [],
    raw_score: 0,
    normalized_score: 0,
    text_length: 0,
  },
};

export function normalizeConflictNodeResult(
  input: unknown
): ModelResult {
  const parsed = conflictNodeResultSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data as ModelResult;
  }

  return {
    ...CONFLICT_NODE_FALLBACK,
    metadata: {
      ...CONFLICT_NODE_FALLBACK.metadata,
      parse_error: true,
      parse_issue_count: parsed.error.issues.length,
    },
  } as ModelResult;
}
