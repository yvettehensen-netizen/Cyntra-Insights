// ============================================================
// AURELIUS — EXECUTIVE JSON EXPORT (CANON UPGRADE)
//
// DOEL:
// - Boardroom & vault-ready JSON export
// - HGBCO + besluitmetadata future-proof
// - Add-only: legacy consumers blijven werken
// ============================================================

/* ============================================================
   TYPES
============================================================ */

export interface AnalysisData {
  /* ================= CORE ================= */
  title: string;
  executive_summary?: string;
  insights?: string;
  risks?: string;
  opportunities?: string;
  roadmap_90d?: string;
  full_text?: string;
  timestamp?: string;

  /* ================= ADD ONLY ================= */
  hgbco?: {
    H?: string;
    G?: string;
    B?: string[];
    C?: string[];
    O?: string;
  };

  decision_readiness?: {
    has_explicit_decision?: boolean;
    has_tradeoffs?: boolean;
    has_consequences?: boolean;
  };

  confidence?: number;
  analysis_type?: string;
  organisation?: string;

  /* ================= EXTENSIBLE ================= */
  [key: string]: unknown;
}

/* ============================================================
   GENERATOR
============================================================ */

export function generateJSON(data: AnalysisData): void {
  const {
    title,
    timestamp,
    executive_summary,
    insights,
    risks,
    opportunities,
    roadmap_90d,
    full_text,
    hgbco,
    decision_readiness,
    confidence,
    analysis_type,
    organisation,
    ...rest
  } = data;

  const exportData = {
    /* ========================================================
       META
    ======================================================== */
    metadata: {
      title,
      organisation: organisation ?? null,
      analysis_type: analysis_type ?? null,
      generated_at: timestamp ?? new Date().toISOString(),
      generator: "Aurelius Executive Intelligence",
      version: "2.0",
      confidence: confidence ?? null,
      decision_readiness: decision_readiness ?? null,
    },

    /* ========================================================
       EXECUTIVE ANALYSIS (LEGACY SAFE)
    ======================================================== */
    analysis: {
      executive_summary: executive_summary ?? "",
      insights: insights ?? "",
      risks: risks ?? "",
      opportunities: opportunities ?? "",
      roadmap_90d: roadmap_90d ?? "",
      full_text: full_text ?? "",
    },

    /* ========================================================
       HGBCO — DECISION BACKBONE (ADD ONLY)
    ======================================================== */
    hgbco: hgbco ?? null,

    /* ========================================================
       ADDITIONAL / EXTENDED DATA
       (No collisions with canon fields)
    ======================================================== */
    additional_data: Object.keys(rest).length > 0 ? rest : null,
  };

  /* ============================================================
     FILE EXPORT
  ============================================================ */

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeTitle = title
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

  link.href = url;
  link.download = `aurelius-${safeTitle}-${Date.now()}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
