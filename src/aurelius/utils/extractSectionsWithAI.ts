// ============================================================
// src/aurelius/utils/extractSectionsWithAI.ts
// HGBCO SECTION EXTRACTOR — CANON FINAL (STRICT TS SAFE)
//
// Supports:
// - HGBCO v1 (string-based)
// - HGBCO v3 (object-based)
// - Legacy markdown fallback blocks
//
// RULES:
// - ADD ONLY
// - NO MIXED UNION ARRAYS
// - STRICT TYPESCRIPT SAFE
// ============================================================

/* ============================================================
   TYPES
============================================================ */

export interface HGBCOResult {
  H?: string | Record<string, unknown>;
  G?: string | Record<string, unknown>;
  B?: string[] | Record<string, unknown>[];
  C?: string[] | Record<string, unknown>[];
  O?: string | Record<string, unknown>;
}

export interface AnalysisResult {
  hgbco?: HGBCOResult;

  executive_summary?: string;
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
}

/* ============================================================
   HELPERS — MARKDOWN
============================================================ */

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBlock(
  markdown: string,
  title: string
): string | undefined {
  const escaped = escapeRegex(title);
  const regex = new RegExp(
    `###\\s*(?:\\d+\\.\\d*\\s*)?${escaped}[\\s\\S]*?(?=\\n###\\s|$)`,
    "i"
  );

  const match = markdown.match(regex);
  return match
    ? match[0].replace(/###.*\n/, "").trim()
    : undefined;
}

function extractList(
  markdown: string,
  title: string
): string[] | undefined {
  const block = extractBlock(markdown, title);
  if (!block) return undefined;

  const lines = block.split("\n");
  const items: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*([-*•]|\d+[.)])\s*(.*)/);
    if (match) {
      if (buffer.length) {
        items.push(buffer.join(" ").trim());
        buffer = [];
      }
      buffer.push(match[2].trim());
    } else if (line.trim()) {
      buffer.push(line.trim());
    }
  }

  if (buffer.length) {
    items.push(buffer.join(" ").trim());
  }

  return items.filter(Boolean);
}

/* ============================================================
   HELPERS — TYPE NORMALIZATION
============================================================ */

function normalizeValue(
  block?: string
): string | Record<string, unknown> | undefined {
  if (!block) return undefined;

  try {
    const parsed = JSON.parse(block);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* noop */
  }

  return block;
}

/**
 * CRITICAL:
 * - returns string[] OR object[]
 * - NEVER (string | object)[]
 */
function normalizeList(
  items?: string[]
): string[] | Record<string, unknown>[] | undefined {
  if (!items || items.length === 0) return undefined;

  const parsed = items.map((item) => {
    try {
      const json = JSON.parse(item);
      if (
        json &&
        typeof json === "object" &&
        !Array.isArray(json)
      ) {
        return json as Record<string, unknown>;
      }
    } catch {
      /* noop */
    }
    return item;
  });

  const containsObject = parsed.some(
    (v) => typeof v === "object"
  );

  if (containsObject) {
    return parsed.filter(
      (v): v is Record<string, unknown> =>
        typeof v === "object"
    );
  }

  return parsed as string[];
}

/* ============================================================
   MAIN HGBCO EXTRACTOR
============================================================ */

export function extractSectionsWithAI(
  markdown: string
): AnalysisResult {
  const H = normalizeValue(
    extractBlock(markdown, "H — Huidige realiteit") ??
      extractBlock(markdown, "H — Huidige situatie")
  );

  const G = normalizeValue(
    extractBlock(markdown, "G — Gekozen richting") ??
      extractBlock(markdown, "G — Gewenste situatie")
  );

  const O = normalizeValue(
    extractBlock(markdown, "O — Ownership & executie") ??
      extractBlock(markdown, "O — Outcome / Opbrengst")
  );

  const B = normalizeList(
    extractList(markdown, "B — Blokkades") ??
      extractList(markdown, "B — Belemmeringen") ??
      extractList(markdown, "Belemmeringen")
  );

  const C = normalizeList(
    extractList(markdown, "C — Interventies") ??
      extractList(markdown, "C — Concreet plan") ??
      extractList(markdown, "Concreet plan")
  );

  const hgbco: HGBCOResult | undefined =
    H || G || B || C || O
      ? { H, G, B, C, O }
      : undefined;

  return {
    hgbco,

    executive_summary:
      extractBlock(markdown, "Executive Summary") ??
      extractBlock(markdown, "Samenvatting"),

    insights:
      extractList(markdown, "Kerninzichten") ??
      extractList(markdown, "Inzichten"),

    risks:
      extractList(markdown, "Risico") ??
      extractList(markdown, "Risico’s"),

    opportunities:
      extractList(markdown, "Kansen") ??
      extractList(markdown, "Opportunities"),
  };
}
