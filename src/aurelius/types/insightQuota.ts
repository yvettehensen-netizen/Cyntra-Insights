/**
 * InsightQuota
 * ================================
 * Definieert minimale inhoudelijke vereisten per output-sectie.
 *
 * Wordt gebruikt voor:
 * - Consultant contract enforcement
 * - Runtime output-validatie
 * - Retry policies
 * - Deterministische PDF-expansie (20–40 pagina’s)
 * - Synthese-gewichten en kwaliteitscontrole
 *
 * Alle velden zijn optioneel:
 * - Niet gespecificeerd = geen minimale eis
 * - Gespecificeerd = harde ondergrens
 *
 * ⚠️ Waarden representeren MINIMUM aantallen (>=)
 */

export interface InsightQuota {
  /* ===================== CORE FACTUAL ===================== */

  /** Minimum aantal objectieve vaststellingen (wat IS er aantoonbaar). */
  readonly claims?: number;

  /** Minimum aantal bewijsstukken (citaten, signalen, bronnen, patronen). */
  readonly evidence?: number;

  /** Minimum aantal expliciet benoemde risico’s of kwetsbaarheden. */
  readonly risks?: number;

  /** Minimum aantal benoemde blinde vlekken of ontbrekende informatie. */
  readonly blindspots?: number;

  /* ===================== STRATEGIC / ANALYTICAL ===================== */

  /** Minimum aantal strategische of operationele kansen. */
  readonly opportunities?: number;

  /** Algemene observaties (diagnostisch, niet normatief). */
  readonly observations?: number;

  /* ===================== ADVISORY ===================== */

  /** Minimum aantal aanbevelingen (alleen voor advisory consultants). */
  readonly recommendations?: number;

  /* ===================== QUANTITATIVE ===================== */

  /** Minimum aantal meetbare metrics, KPI’s of kwantitatieve indicatoren. */
  readonly metrics?: number;

  /* ===================== EXTENSIBILITY ===================== */

  /**
   * Vrij uitbreidbaar voor domein-specifieke quotas.
   *
   * Voorbeelden:
   * - "benchmarks": number
   * - "scenarios": number
   * - "dependencies": number
   * - "controls": number
   * - "assumptions": number
   *
   * ⚠️ Waarde moet altijd een number zijn (minimale count)
   */
  readonly [key: string]: number | undefined;
}
