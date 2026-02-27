import { anchorValues, extractAnchors, type NarrativeAnchor } from "./anchorExtractor";

export type AnchorScanSectionResult = {
  section: number;
  heading: string;
  anchorsUsed: string[];
  anchorsUsedCount: number;
};

export type AnchorScanResult = {
  overallUniqueAnchorsUsed: number;
  perSectionAnchorsUsed: AnchorScanSectionResult[];
  missingAnchors: string[];
  unanchoredClaims: string[];
};

const HEADING_RE = /^###\s*(\d+)\.\s*([^\n]+)$/gm;
const HARD_CLAIM_RE = /\b(onomkeerbaar|irreversibel|beslismonopolie|contractmacht|reputatieschade|retentie|doorbraak|exponentieel|catastrofaal)\b|(?:€\s*\d|\d+\s*%)/i;

function parseSections(text: string): Array<{ section: number; heading: string; body: string }> {
  const source = String(text ?? "");
  const matches = [...source.matchAll(HEADING_RE)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      section: Number(match[1] || 0),
      heading: String(match[2] || "").trim(),
      body: source.slice(start, end).replace(/^\n+/, "").trim(),
    };
  });
}

function sentenceSplit(text: string): string[] {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function includesAnchor(text: string, anchor: string): boolean {
  return text.toLowerCase().includes(anchor.toLowerCase());
}

export function scanAnchors(anchors: NarrativeAnchor[] | string[], narrativeText: string): AnchorScanResult {
  const values = Array.isArray(anchors) && typeof anchors[0] === "string"
    ? (anchors as string[])
    : anchorValues(anchors as NarrativeAnchor[]);

  const sections = parseSections(narrativeText);
  const allUsed = new Set<string>();

  const perSectionAnchorsUsed = sections.map((section) => {
    const used = values.filter((anchor) => includesAnchor(section.body, anchor));
    used.forEach((anchor) => allUsed.add(anchor));
    return {
      section: section.section,
      heading: section.heading,
      anchorsUsed: used,
      anchorsUsedCount: used.length,
    };
  });

  const missingAnchors = values.filter((anchor) => !allUsed.has(anchor)).slice(0, 20);

  const unanchoredClaims = sentenceSplit(narrativeText)
    .filter((sentence) => HARD_CLAIM_RE.test(sentence))
    .filter((sentence) => values.every((anchor) => !includesAnchor(sentence, anchor)))
    .slice(0, 20);

  return {
    overallUniqueAnchorsUsed: allUsed.size,
    perSectionAnchorsUsed,
    missingAnchors,
    unanchoredClaims,
  };
}

export function scanAnchorsFromContext(context: string, narrativeText: string): AnchorScanResult {
  const anchors = extractAnchors(context);
  return scanAnchors(anchors, narrativeText);
}
