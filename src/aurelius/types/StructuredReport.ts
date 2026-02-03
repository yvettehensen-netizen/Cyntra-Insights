import type { ReportSection } from "../config/reportFlow";

/* ============================================================================
   CORE IDENTIFIERS — DECISION & GOVERNANCE READY
============================================================================ */

/**
 * Unieke identifier voor een subsectie.
 * URL-, TOC- en audit-vriendelijk.
 */
export type SubSectionId = string;

/**
 * Impact-classificatie voor bestuurlijke prioritering
 */
export type ImpactLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

/**
 * Vertrouwelijkheidsniveau — juridisch & audit-proof
 */
export type ConfidentialityLevel =
  | "public"
  | "internal"
  | "confidential"
  | "strictly-confidential";

/**
 * Besluitdomein — koppelt rapportinhoud aan decision engine
 */
export type DecisionDomain =
  | "Porter"
  | "PESTEL"
  | "McKinsey7S"
  | "GROW"
  | "VIBAAAN"
  | "HGBCO"
  | "Governance"
  | "Execution"
  | "Culture"
  | "Understream";

/* ============================================================================
   SUBSECTIONS — DIEPGANG & BESLUITLOGICA
============================================================================ */

export interface StructuredSubSection {
  /** Unieke ID (anchors, cross-links, audit trail) */
  id: SubSectionId;

  /** Professionele titel */
  title: string;

  /** Volledige inhoud (meerdere paragrafen toegestaan) */
  content: string;

  /** Korte highlight voor TOC / preview / AI-routing */
  highlight?: string;

  /** Impact op besluitvorming */
  impactLevel?: ImpactLevel;

  /** Besluitdomeinen waarop deze subsectie ingrijpt */
  decisionDomains?: DecisionDomain[];

  /** Labels voor filtering of latere analyse */
  tags?: string[];

  /** Audit-indicatie: feitelijk vs interpretatief */
  factualBasis?: "observed" | "derived" | "interpreted";
}

/* ============================================================================
   SECTIONS — BOARDROOM STRUCTUUR
============================================================================ */

export interface StructuredSection {
  /** Sleutel uit analyseflow (single source of truth) */
  key: ReportSection;

  /** Vastgestelde sectietitel */
  title: string;

  /** Executive samenvatting (1–3 zinnen) */
  summary: string;

  /** Subsecties voor diepte & bewijsvoering */
  subsections: StructuredSubSection[];

  /** Dominante thema’s */
  tags?: string[];

  /** Hoogste impact binnen deze sectie */
  impactLevel?: ImpactLevel;

  /** Primaire besluitdomeinen van deze sectie */
  decisionDomains?: DecisionDomain[];
}

/* ============================================================================
   EXECUTIVE METADATA — GOVERNANCE & AUDIT
============================================================================ */

export interface ReportMetadata {
  companyName: string;
  reportTitle: string;
  generatedAt: string;

  version?: string;
  generatedBy?: string;
  confidentiality?: ConfidentialityLevel;

  /** Gebruikte analysekaders */
  analysisTypes?: ReportSection[];

  /** Interne of juridische referentie */
  referenceId?: string;

  /** Bestuurlijke status van het rapport */
  boardStatus?: "concept" | "reviewed" | "approved";

  /** Besluitverantwoordelijke */
  decisionOwner?: string;
}

/* ============================================================================
   FINALE STRUCTURED REPORT — DECISION SOURCE OF TRUTH
============================================================================ */

export interface StructuredReport {
  /** Executive verdict — bestuurlijk leidend */
  executive_summary: string;

  /** Rapportsecties in vaste volgorde */
  sections: StructuredSection[];

  /** Metadata voor governance & audit */
  metadata: ReportMetadata;

  /** Overkoepelende inzichten */
  cross_sectional_insights?: string[];

  /** Concrete C-level aanbevelingen (HGBCO-C) */
  key_recommendations?: string[];

  /** Organisatierisico’s (enterprise level) */
  enterprise_risks?: string[];

  /** Optioneel: expliciete koppeling naar HGBCO */
  linked_decision_card_id?: string;
}
