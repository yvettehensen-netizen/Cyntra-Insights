export type AnchorType = "name" | "role" | "artifact" | "number" | "process";

export type NarrativeAnchor = {
  value: string;
  type: AnchorType;
};

const ROLE_RE = /\b(ceo|cfo|coo|chro|cto|raad van bestuur|rvb|raad van toezicht|rvt|directeur|manager|teamlead|planner|projectleider|medisch directeur|compliance officer)\b/gi;
const ARTIFACT_RE = /\b(intake|planning|dashboard|contractvorm|contract|wachttijd|igj|instroomkader|doorlooptijd|escalatiepad|besluitlog|gate|kpi)\b/gi;
const PROCESS_RE = /\b(consolidatie|herallocatie|prioritering|escalatie|normaliseren|bypass|conflictmijding|mandaatverschuiving|herijking|capaciteitssturing)\b/gi;
const NUMBER_RE = /(?:€\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\b\s*(?:dagen|dag|weken|maanden|fte)?)/g;
const NAME_RE = /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g;

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function uniqueAnchors(items: NarrativeAnchor[]): NarrativeAnchor[] {
  const seen = new Set<string>();
  const out: NarrativeAnchor[] = [];
  for (const item of items) {
    const key = `${item.type}:${item.value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function collect(regex: RegExp, text: string, type: AnchorType): NarrativeAnchor[] {
  const matches = text.match(regex) ?? [];
  return matches
    .map((m) => normalize(m))
    .filter((m) => m.length >= 3)
    .map((value) => ({ value, type }));
}

export function extractAnchors(context: string): NarrativeAnchor[] {
  const source = String(context ?? "");
  const anchors = [
    ...collect(ROLE_RE, source, "role"),
    ...collect(ARTIFACT_RE, source, "artifact"),
    ...collect(PROCESS_RE, source, "process"),
    ...collect(NUMBER_RE, source, "number"),
    ...collect(NAME_RE, source, "name"),
  ];

  return uniqueAnchors(anchors).slice(0, 250);
}

export function anchorValues(anchors: NarrativeAnchor[]): string[] {
  return [...new Set(anchors.map((a) => normalize(a.value)).filter(Boolean))];
}
