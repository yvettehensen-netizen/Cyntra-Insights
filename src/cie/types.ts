/* =========================
   ANALYSIS KINDS
========================= */

/**
 * Canonical Aurelius analysis identifiers.
 * → Wordt gebruikt voor routing, AI-prompts, synthese en PDF-structuur
 */
export type AureliusAnalysisKind =
  | "strategy"
  | "financial_strategy"
  | "growth"
  | "market"
  | "process"
  | "swot"
  | "leadership"
  | "team_dynamics"
  | "culture"
  | "change"
  | "understream"
  | "esg"
  | "ai_data"
  | "finance";

/* =========================
   SECTION CONTENT
========================= */

/**
 * Toegestane vormen van sectie-inhoud.
 * - string → verhalende analyse
 * - string[] → puntsgewijze inzichten
 */
export type AnalysisSectionContent =
  | string
  | string[];

/**
 * Genormaliseerde sectie.
 * Titel is altijd board-readable.
 */
export interface AnalysisSection {
  title: string;
  content: AnalysisSectionContent;
}

/* =========================
   NORMALIZED ANALYSIS
========================= */

/**
 * Genormaliseerde output van één Aurelius-analyse.
 *
 * Deze structuur is:
 * - de enige toegestane input voor synthese
 * - veilig voor AI-verrijking
 * - stabiel voor PDF / board-decks
 */
export interface NormalizedAnalysis {
  /** Type analyse (routing / synthese / governance) */
  kind: AureliusAnalysisKind;

  /** Board-ready titel */
  title: string;

  /** Samenvatting op executive-niveau */
  executive_summary: string;

  /**
   * Inhoudelijke analyse-secties.
   * Key = interne identifier (bijv. "risks", "opportunities")
   */
  sections: Record<string, AnalysisSection>;

  /** Onbewerkte LLM-output (audit / debug / fallback) */
  raw_markdown: string;

  /** Optioneel: metadata voor traceability */
  meta?: {
    model?: string;
    generated_at?: string; // ISO date
    confidence?: number;   // 0–1
  };
}
