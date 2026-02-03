// ============================================================
// src/aurelius/types/aurelius.types.ts
// CYNTRA / AURELIUS — CANONICAL TYPES (CIRCULAR-SAFE, MAX UPGRADE)
// SINGLE SOURCE OF TRUTH • exactOptionalPropertyTypes SAFE
// NO SELF-REFERENCING • NO ANY • NO DOWNGRADE
// ============================================================

/* =========================
   ANALYSIS IDENTIFIERS
   ❗ HARD UNION — NOT DERIVED
========================= */

export type AureliusAnalysisType =
  // Strategy & direction
  | "strategy"
  | "growth_scaling"
  | "decision_dynamics"

  // People & culture
  | "leadership"
  | "team_alignment"
  | "culture"

  // Execution & structure
  | "execution"
  | "governance"
  | "ownership"

  // Finance & operations
  | "finance"
  | "operations"
  | "risk"

  // Commercial & market
  | "commercial"
  | "product"
  | "marketing"
  | "sales";

/* =========================
   RESULT SHAPE (EXECUTIVE-GRADE)
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

  // extensibility hook (audit-safe)
  [key: string]: unknown;
}

/* =========================
   INTERNAL HELPERS
========================= */

function extractSections(
  markdown: string
): Record<string, { title: string; content: string }> {
  const regex = /###\s*(?:\d+\.\s*)?(.+?)(?=\n|$)/g;
  const matches = [...markdown.matchAll(regex)];

  const sections: Record<string, { title: string; content: string }> =
    {};

  matches.forEach((match, index) => {
    if (match.index == null) return;

    const title = match[1]?.trim() || "Onbekende sectie";

    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;

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
  if (!/^\s*([-*•]|\d+[.)])/m.test(content)) return content;

  const lines = content.split("\n");
  const items: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*([-*•]|\d+[.)])\s*(.*)/);
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

function resolveField(
  sections: AureliusAnalysisResult["sections"],
  keys: readonly string[],
  fallback = ""
): string {
  for (const key of keys) {
    const section = sections[key];
    if (section && typeof section.content === "string") {
      return section.content;
    }
  }
  return fallback;
}

/* =========================
   MAIN PARSER — CANONICAL
========================= */

export function parseAureliusReport(
  markdown: string,
  analysis_type: AureliusAnalysisType
): AureliusAnalysisResult {
  const normalized = markdown.trim().replace(/\r\n/g, "\n");

  const extracted = extractSections(normalized);
  const sections: AureliusAnalysisResult["sections"] =
    {};

  for (const [key, section] of Object.entries(extracted)) {
    sections[key] = {
      title: section.title,
      content: normalizeContent(section.content),
    };
  }

  /* =========================
     90-DAGEN ROADMAP (OPTIONEEL)
  ========================= */

  const roadmapKey = "90_dagen_actieplan";
  const roadmapSection = sections[roadmapKey];

  if (
    roadmapSection &&
    typeof roadmapSection.content === "string"
  ) {
    const subs = extractSections(roadmapSection.content);
    const roadmap: Record<string, string[]> = {};

    for (const s of Object.values(subs)) {
      const parsed = normalizeContent(s.content);
      if (Array.isArray(parsed)) {
        roadmap[
          s.title.toLowerCase().replace(/\s+/g, "_")
        ] = parsed;
      }
    }

    sections[roadmapKey] = {
      title: "90-Dagen Actieplan",
      content: roadmap,
    };
  }

  /* =========================
     FINAL — exactOptionalPropertyTypes SAFE
  ========================= */

  return {
    analysis_type,

    title: resolveField(
      sections,
      ["title", "titel"],
      "Analyse"
    ),

    executive_summary: resolveField(
      sections,
      [
        "executive_summary",
        "samenvatting",
        "overzicht",
      ],
      ""
    ),

    sections,
    raw_markdown: normalized,
  };
}
