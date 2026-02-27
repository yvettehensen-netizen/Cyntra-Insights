export const CANONICAL_HEADINGS = [
  "### 1. DOMINANTE BESTUURLIJKE THESE",
  "### 2. HET KERNCONFLICT",
  "### 3. EXPLICIETE TRADE-OFFS",
  "### 4. OPPORTUNITY COST",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
  "### 7. EXECUTIERISICO",
  "### 8. 90-DAGEN INTERVENTIEPLAN",
  "### 9. DECISION CONTRACT",
] as const;

export type NarrativeSection = {
  number: number;
  heading: string;
  body: string;
};

const HEADING_RE = /^###\s*(\d+)\.\s*([^\n]+)$/gm;

export function parseSections(text: string): NarrativeSection[] {
  const source = String(text ?? "").replace(/\r\n?/g, "\n");
  const matches = [...source.matchAll(HEADING_RE)];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      number: Number(match[1] || 0),
      heading: match[0].trim(),
      body: source.slice(start, end).replace(/^\n+/, "").trim(),
    };
  });
}

export function normalize(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\p{L}\p{N}%€\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

export function ngramOverlap(a: string, b: string, n = 4): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);
  if (aTokens.length < n || bTokens.length < n) return 0;

  const grams = (tokens: string[]) => {
    const out = new Set<string>();
    for (let i = 0; i <= tokens.length - n; i += 1) {
      out.add(tokens.slice(i, i + n).join(" "));
    }
    return out;
  };

  const A = grams(aTokens);
  const B = grams(bTokens);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const gram of A) {
    if (B.has(gram)) shared += 1;
  }

  return shared / Math.min(A.size, B.size);
}

export function firstContentLine(body: string): string {
  return (
    String(body ?? "")
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

export function sentences(text: string): string[] {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
