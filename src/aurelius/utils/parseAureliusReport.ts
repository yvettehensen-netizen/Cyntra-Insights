// ============================================================
// AURELIUS REPORT PARSER — CANON UPGRADE (FINAL)
// Supports:
// ✅ Besluitgericht narratief (NL)
// ✅ Max 6 boardroom-hoofdstukken
// ✅ Interventieplan (legacy, behouden)
// ✅ Roadmap fallback (90 dagen)
// ✅ Parser- & PDF-safe
//
// ➕ ADD ONLY:
// - Canonical section order (boardroom)
// - Decision metadata (HGBCO / VIBAAAN readiness)
// ============================================================

/* =========================
   TYPES
========================= */

import type { AnalysisType as AureliusAnalysisType } from "../types";

/* =========================
   CANONICAL BOARDROOM ORDER
   (ADD ONLY — UI / decision layers may consume)
========================= */

export const CANONICAL_SECTION_ORDER = [
  "waar_staan_we_nu_echt",
  "wat_hier_fundamenteel_schuurt",
  "wat_er_gebeurt_als_er_niets_verandert",
  "de_keuzes_die_nu_voorliggen",
  "wat_dit_vraagt_van_bestuur_en_organisatie",
  "het_besluit_dat_nu_nodig_is",
] as const;

type CanonicalSectionKey =
  (typeof CANONICAL_SECTION_ORDER)[number];

/* =========================
   MAIN RESULT TYPE
========================= */

export interface AureliusAnalysisResult {
  analysis_type: AureliusAnalysisType;

  title: string;
  executive_summary: string;

  sections: Record<
    string,
    {
      title: string;
      content: string | string[] | Record<string, string[]>;
    }
  >;

  raw_markdown: string;

  /** Legacy interventies (niet downgraden) */
  interventions?: Record<string, string[]>;

  /* ================= ADD ONLY ================= */
  canonical_sections_present?: boolean;
  decision_readiness?: {
    has_explicit_decision: boolean;
    has_tradeoffs: boolean;
    has_consequences: boolean;
  };
  /* ============================================ */

  [key: string]: unknown;
}

/* =========================
   HELPERS
========================= */

function extractSections(
  markdown: string
): Record<string, { title: string; content: string }> {
  const regex = /###\s*(?:\d+\.?\d*\s*)?(.+?)(?=\n|$)/g;
  const matches = [...markdown.matchAll(regex)];

  const sections: Record<
    string,
    { title: string; content: string }
  > = {};

  matches.forEach((match, index) => {
    if (match.index == null) return;

    const title = match[1]?.trim() ?? "Onbekende sectie";
    const start = match.index + match[0].length;
    const end =
      matches[index + 1]?.index ?? markdown.length;

    const content = markdown
      .slice(start, end)
      .replace(/^\n+/, "")
      .trim();

    const key = title
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    sections[key] = { title, content };
  });

  return sections;
}

function normalizeContent(
  content: string
): string | string[] {
  if (!/^\s*([-*•]|\d+[.)])/m.test(content)) {
    return content;
  }

  const lines = content.split("\n");
  const items: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(
      /^\s*([-*•]|\d+[.)])\s*(.*)/
    );

    if (match) {
      if (buffer.length) {
        items.push(buffer.join(" ").trim());
        buffer = [];
      }
      buffer.push(match[2]?.trim() ?? "");
    } else if (line.trim()) {
      buffer.push(line.trim());
    }
  }

  if (buffer.length) {
    items.push(buffer.join(" ").trim());
  }

  return items.filter(Boolean);
}

/* =========================
   ADD ONLY — DECISION SIGNAL CHECKS
========================= */

function detectDecisionSignals(text: string) {
  const lc = text.toLowerCase();

  return {
    has_explicit_decision:
      lc.includes("besluit") || lc.includes("moet nu"),
    has_tradeoffs:
      lc.includes("keuze") ||
      lc.includes("keuzeconflict") ||
      lc.includes("stop"),
    has_consequences:
      lc.includes("gevolg") ||
      lc.includes("consequentie") ||
      lc.includes("als er niets verandert"),
  };
}

/* =========================
   MAIN PARSER
========================= */

export function parseAureliusReport(
  markdown: string,
  analysis_type: AureliusAnalysisType
): AureliusAnalysisResult {
  const normalized = markdown
    .trim()
    .replace(/\r\n/g, "\n");

  const extracted = extractSections(normalized);

  const sections: AureliusAnalysisResult["sections"] =
    {};

  for (const [key, section] of Object.entries(
    extracted
  )) {
    sections[key] = {
      title: section.title,
      content: normalizeContent(section.content),
    };
  }

  /* ============================================================
     INTERVENTIEPLAN SUPPORT (LEGACY — ADD ONLY)
  ============================================================ */

  const interventionKey = "interventieplan";
  const interventionSection = sections[interventionKey];

  let interventions:
    | Record<string, string[]>
    | undefined = undefined;

  if (
    interventionSection &&
    typeof interventionSection.content === "string"
  ) {
    const subs = extractSections(
      interventionSection.content
    );
    interventions = {};

    for (const sub of Object.values(subs)) {
      const parsed = normalizeContent(sub.content);
      if (Array.isArray(parsed)) {
        interventions[
          sub.title
            .toLowerCase()
            .replace(/\s+/g, "_")
        ] = parsed;
      }
    }

    sections[interventionKey] = {
      title: "Interventieplan",
      content: interventions,
    };
  }

  /* ============================================================
     LEGACY ROADMAP FALLBACK (NIET VERWIJDEREN)
  ============================================================ */

  const roadmapKey = "90_dagen_actieplan";
  const roadmapSection = sections[roadmapKey];

  if (
    roadmapSection &&
    typeof roadmapSection.content === "string"
  ) {
    const subs = extractSections(roadmapSection.content);
    const roadmap: Record<string, string[]> = {};

    for (const sub of Object.values(subs)) {
      const parsed = normalizeContent(sub.content);
      if (Array.isArray(parsed)) {
        roadmap[
          sub.title
            .toLowerCase()
            .replace(/\s+/g, "_")
        ] = parsed;
      }
    }

    sections[roadmapKey] = {
      title: "Legacy Roadmap (Fallback)",
      content: roadmap,
    };
  }

  /* ============================================================
     ADD ONLY — DECISION READINESS METADATA
  ============================================================ */

  const decisionText =
    typeof sections[
      "het_besluit_dat_nu_nodig_is"
    ]?.content === "string"
      ? (sections[
          "het_besluit_dat_nu_nodig_is"
        ].content as string)
      : "";

  const decisionSignals = decisionText
    ? detectDecisionSignals(decisionText)
    : {
        has_explicit_decision: false,
        has_tradeoffs: false,
        has_consequences: false,
      };

  /* =========================
     FINAL OUTPUT
  ========================= */

  return {
    analysis_type,

    title:
      sections["waar_staan_we_nu_echt"]?.title ??
      "Analyse",

    executive_summary:
      typeof sections["waar_staan_we_nu_echt"]
        ?.content === "string"
        ? (
            sections["waar_staan_we_nu_echt"]
              .content as string
          ).slice(0, 600)
        : "",

    sections,

    interventions,

    raw_markdown: normalized,

    /* ================= ADD ONLY ================= */
    canonical_sections_present:
      CANONICAL_SECTION_ORDER.every(
        (key: CanonicalSectionKey) => key in sections
      ),
    decision_readiness: decisionSignals,
    /* ============================================ */
  };
}
