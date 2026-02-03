// ============================================================
// src/cie/adapters/normalizeFromDocument.ts
// AURELIUS — DOCUMENT NORMALIZATION (SINGLE + MULTI)
// ✅ GEEN EXTERNE TYPE IMPORTS
// ✅ GEEN CIRCULARS
// ✅ 100% TS-VEILIG
// ============================================================

import { normalizeAureliusResult, AureliusResult } from "../normalizer";

/* ============================================================
   TYPES — LOKAAL & EXPLICIET
============================================================ */

export interface DocumentAnalysisPayload {
  readonly document_data: unknown;
  readonly document_context?: {
    readonly confidence?: number;
    readonly scope?: string;
    readonly type?: string;
  };
}

export interface NormalizationOverrides {
  readonly defaultConfidence?: number;
}

export interface NormalizedDocumentResult {
  readonly result: AureliusResult;
  readonly context: {
    readonly confidence_source: "document" | "default" | "normalized";
    readonly scope?: string;
    readonly document_type?: string;
  };
}

export interface NormalizedMultiDocumentResult {
  readonly result: AureliusResult;
  readonly context: {
    readonly document_count: number;
    readonly confidence_source: "documents" | "default" | "normalized";
  };
}

/* ============================================================
   SINGLE DOCUMENT NORMALIZER
============================================================ */

export function normalizeDocumentAnalysis(
  payload: DocumentAnalysisPayload,
  overrides: NormalizationOverrides = {}
): NormalizedDocumentResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: expected object.");
  }

  const base = normalizeAureliusResult(payload.document_data);
  const ctx = payload.document_context ?? {};

  const confidence =
    typeof ctx.confidence === "number" &&
    ctx.confidence >= 0 &&
    ctx.confidence <= 1
      ? ctx.confidence
      : overrides.defaultConfidence ?? base.confidence_score;

  return {
    result: {
      ...base,
      confidence_score: confidence,
    },
    context: {
      confidence_source:
        typeof ctx.confidence === "number"
          ? "document"
          : overrides.defaultConfidence !== undefined
          ? "default"
          : "normalized",
      ...(ctx.scope ? { scope: ctx.scope } : {}),
      ...(ctx.type ? { document_type: ctx.type } : {}),
    },
  };
}

/* ============================================================
   MULTI DOCUMENT NORMALIZER (20+ DOCS)
============================================================ */

export function normalizeMultipleDocumentAnalyses(
  payloads: readonly DocumentAnalysisPayload[],
  overrides: NormalizationOverrides = {}
): NormalizedMultiDocumentResult {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error("Expected at least one document payload.");
  }

  const normalized = payloads.map((p) =>
    normalizeDocumentAnalysis(p, overrides)
  );

  const merged = normalized.reduce((acc, cur) => {
    return {
      ...acc,
      ...cur.result,
      sections: {
        ...(acc as any).sections,
        ...(cur.result as any).sections,
      },
      interventions: [
        ...((acc as any).interventions ?? []),
        ...((cur.result as any).interventions ?? []),
      ],
    };
  }, {} as AureliusResult);

  const confidences = normalized
    .map((n) => n.result.confidence_score)
    .filter((c): c is number => typeof c === "number");

  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : overrides.defaultConfidence ?? merged.confidence_score;

  return {
    result: {
      ...merged,
      confidence_score: avgConfidence,
    },
    context: {
      document_count: payloads.length,
      confidence_source:
        confidences.length > 0
          ? "documents"
          : overrides.defaultConfidence !== undefined
          ? "default"
          : "normalized",
    },
  };
}
