// src/aurelius/engine/nodes/ExpertNode.ts

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   AURELIUS — EXPERT NODE CONTRACT (MAXIMAL CANON)
   RULES:
   - ADD ONLY
   - NO BREAKING CHANGES
   - ALL EXISTING NODES MUST STILL COMPILE
============================================================ */

/* =========================
   CORE CONTRACT (LEGACY — DO NOT CHANGE)
========================= */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;

  analyze(context: AnalysisContext): Promise<ModelResult>;

  /* ================= ADD ONLY ================= */

  /**
   * Unieke node-identificatie (machine-safe).
   * Indien niet opgegeven, orchestrator mag `name` normaliseren.
   */
  readonly id?: string;

  /**
   * Domein waarin deze node opereert
   * (routing, filtering, synthesis, governance).
   */
  readonly domain?: ExpertDomain;

  /**
   * Strategisch gewicht van deze node in synthese
   * 1 = ondersteunend
   * 5 = beslissend
   */
  readonly weight?: 1 | 2 | 3 | 4 | 5;

  /**
   * Indicatie of deze node beslissingen mag beïnvloeden
   * (HGBCO / VIBAAAN / Boardroom layers).
   */
  readonly decision_relevant?: boolean;

  /**
   * Verwachte output-structuur (voor orchestrator & validators).
   * Geen enforce — alleen contractuele intentie.
   */
  readonly output_schema?: ExpertOutputSchema;

  /**
   * Metadata over maturiteit en upgrade-beleid
   * (no-downgrade, experimental, locked, etc.)
   */
  readonly policy?: ExpertPolicy;
}

/* ============================================================
   ADD ONLY — SUPPORTING TYPES
============================================================ */

/**
 * Domeinen voor routing & synthese
 */
export type ExpertDomain =
  | "strategy"
  | "finance"
  | "operations"
  | "people"
  | "culture"
  | "governance"
  | "technology"
  | "ai_data"
  | "esg"
  | "risk"
  | "synthesis";

/**
 * Beschrijft (optioneel) wat deze node oplevert
 * → gebruikt door validators / PDF / UI
 */
export interface ExpertOutputSchema {
  insights?: boolean;
  risks?: boolean;
  opportunities?: boolean;
  recommendations?: boolean;
  roadmap_90d?: boolean;
  score?: boolean;
  urgency?: boolean;
  executive_thesis?: boolean;
}

/**
 * Governance & lifecycle policy
 */
export interface ExpertPolicy {
  /**
   * true = output mag nooit downgraded worden
   */
  no_downgrade?: boolean;

  /**
   * false = node is experimenteel / advisory
   */
  boardroom_safe?: boolean;

  /**
   * Versie of generatie van de node
   */
  version?: string;

  /**
   * Upgrade-strategie
   */
  upgrade_policy?: "add_only" | "locked" | "experimental";
}
