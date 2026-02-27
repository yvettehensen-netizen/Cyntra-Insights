import { parseSections } from "@/aurelius/executive/gates/utils";
import { scanAnchors } from "./anchorScan";

function normalize(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ngramSet(text: string, n = 4): Set<string> {
  const words = normalize(text).split(" ").filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i <= words.length - n; i += 1) {
    out.add(words.slice(i, i + n).join(" "));
  }
  return out;
}

function overlapRatio(a: string, b: string): number {
  const A = ngramSet(a);
  const B = ngramSet(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const gram of A) {
    if (B.has(gram)) shared += 1;
  }
  return shared / Math.min(A.size, B.size);
}

function section8Uniqueness(text: string): number {
  const section8 = parseSections(text).find((section) => section.number === 8)?.body ?? "";
  const actions = section8
    .split(/\bActie:/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => normalize(chunk).slice(0, 180));

  if (!actions.length) return 0;
  const unique = new Set(actions);
  return unique.size / actions.length;
}

export function compareReports(a: string, b: string, inputContext = ""): {
  repetitionRatio: number;
  anchorOverlap: number;
  section8InterventionUniquenessA: number;
  section8InterventionUniquenessB: number;
} {
  const repetitionRatio = overlapRatio(a, b);

  const anchorsA = scanAnchors(inputContext || a, a);
  const anchorsB = scanAnchors(inputContext || b, b);
  const setA = new Set(anchorsA.inputAnchors.map((anchor) => normalize(anchor)));
  const setB = new Set(anchorsB.inputAnchors.map((anchor) => normalize(anchor)));
  let shared = 0;
  for (const anchor of setA) {
    if (setB.has(anchor)) shared += 1;
  }
  const anchorOverlap = setA.size && setB.size ? shared / Math.min(setA.size, setB.size) : 0;

  return {
    repetitionRatio,
    anchorOverlap,
    section8InterventionUniquenessA: section8Uniqueness(a),
    section8InterventionUniquenessB: section8Uniqueness(b),
  };
}
