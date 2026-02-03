// ============================================================
// src/aurelius/engine/synthesis.ts
// AURELIUS — HGBCO SYNTHESIS ENGINE
// ADD-ONLY • NO DOWNGRADE • NODE-SAFE
// ============================================================

/* ============================================================
   INPUT CONTRACT (UNCHANGED + EXTENDED)
============================================================ */

export interface SynthesisResult {
  consultant: string;
  output_key: string;
  content: unknown;
}

/* ============================================================
   HGBCO STRUCTURE (ADD ONLY)
============================================================ */

export interface HGBCOBlock {
  H: string;
  G: string;
  B: string[];
  C: string[];
  O: string;
}

export interface HGBCOReport {
  hgbco: HGBCOBlock;

  executive_summary: string;

  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];

  confidence_score: number;
}

/* ============================================================
   INTERNAL NORMALIZERS (NODE-SAFE)
============================================================ */

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(v => typeof v === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

function normalizeConfidence(values: number[]): number {
  if (!values.length) return 0.5;
  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 100) / 100;
}

/* ============================================================
   HGBCO SYNTHESIS CORE
============================================================ */

export function synthesize(results: SynthesisResult[]) {
  const insights: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];
  const recommendations: string[] = [];
  const confidenceValues: number[] = [];

  for (const r of results) {
    const c: any = r.content ?? {};

    insights.push(...normalizeArray(c.insights));
    risks.push(...normalizeArray(c.risks));
    opportunities.push(...normalizeArray(c.opportunities));
    recommendations.push(...normalizeArray(c.recommendations));

    if (typeof c.confidence === "number") {
      confidenceValues.push(c.confidence);
    }
  }

  /* ======================================================
     HGBCO DERIVATION (EXECUTIVE CANON)
  ====================================================== */

  const hgbco: HGBCOBlock = {
    H:
      insights[0] ??
      "De huidige situatie bevat onvoldoende expliciete besluitvorming.",
    G:
      "Besluitvorming stokt door diffuus eigenaarschap en gebrek aan closure-mechanismen.",
    B: risks.slice(0, 5),
    C: recommendations.slice(0, 5),
    O:
      opportunities[0] ??
      "Heldere governance en executie verhogen strategische slagkracht.",
  };

  const report: HGBCOReport = {
    hgbco,

    executive_summary:
      "Dit rapport toont waar besluitvorming vastloopt en welke interventies nodig zijn om closure te forceren.",

    insights,
    risks,
    opportunities,
    recommendations,

    confidence_score: normalizeConfidence(confidenceValues),
  };

  /* ======================================================
     FINAL RETURN (BACKWARD COMPATIBLE)
  ====================================================== */

  return {
    synthesis: results, // ⛔ NOOIT VERWIJDEREN (legacy)
    hgbco_report: report, // ✅ NIEUW — HGBCO NIVEAU
  };
}
