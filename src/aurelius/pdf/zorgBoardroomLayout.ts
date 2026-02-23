// ============================================================
// PDF — CYNTRA INSIGHTS ZORG BOARDROOM REPORT LAYOUT (CANON)
// Style: Executive Minimal • Governance Premium • Cyntra Signature
//
// ✅ MAX UPGRADE WITHOUT BREAKING CANON
// - Pure deterministic layout (no async / no LLM)
// - Cyntra branded theme
// - Business Case Overview section added
// - Metadata + watermark supported
// - Renderer-safe style keys only
// ============================================================

/* ============================================================
   CYNTRA THEME (BOARDROOM PREMIUM)
============================================================ */

export const CYNTRA_ZORG_THEME = {
  primary: "#4F46E5", // Deep Indigo (Cyntra Signature)
  accent: "#10B981", // Emerald (Innovation / Zorg)
  muted: "#6B7280",
  font: "Helvetica", // React-PDF built-in font (no runtime registration required)
  watermark: "Cyntra Insights — Confidential Board Material",
} as const;

/* ============================================================
   SECTION CONTRACT (STRICT)
============================================================ */

export type ZorgPDFSectionStyle =
  | "hero"
  | "matrix"
  | "bullet_block"
  | "action_cards"
  | "roadmap"
  | "business_case";

export interface ZorgPDFSection {
  readonly id: string;
  readonly title: string;
  readonly style: ZorgPDFSectionStyle;
  readonly icon?: string;
}

/* ============================================================
   CANONICAL BOARDROOM LAYOUT (ZORG)
============================================================ */

export const ZorgBoardroomPDFLayout = {
  title: "ZorgScan Boardroom Report",

  theme: CYNTRA_ZORG_THEME,

  metadata: {
    author: "Cyntra Insights AI Platform",
    version: "1.0 (Zorg Boardroom Edition)",
  },

  sections: [
    {
      id: "executive_snapshot",
      title: "Bestuurlijke Samenvatting",
      style: "hero",
      icon: "insights",
    },
    {
      id: "boardroom_tensions",
      title: "Structurele Spanningsvelden",
      style: "matrix",
      icon: "tension",
    },
    {
      id: "governance_pressure_points",
      title: "Governance Pressure Points",
      style: "bullet_block",
      icon: "alert",
    },
    {
      id: "recommended_board_moves",
      title: "Bestuurlijke Interventies",
      style: "action_cards",
      icon: "strategy",
    },
    {
      id: "business_case",
      title: "Business Case Overzicht",
      style: "business_case",
      icon: "roi",
    },
    {
      id: "ninety_day_boardroom_plan",
      title: "90-Dagen Besluitplan",
      style: "roadmap",
      icon: "timeline",
    },
  ] as const satisfies readonly ZorgPDFSection[],
} as const;
