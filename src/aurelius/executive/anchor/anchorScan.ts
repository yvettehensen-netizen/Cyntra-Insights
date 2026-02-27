import { parseSections } from "@/aurelius/executive/gates/utils";

export type AnchorScanResult = {
  inputAnchors: string[];
  outputAnchors: string[];
  recall: number;
  precision: number;
  missingInputAnchors: string[];
  unsupportedOutputAnchors: string[];
  perSection: Array<{
    section: number;
    heading: string;
    anchorHits: number;
    score: number;
  }>;
};

const STOP = new Set([
  "de",
  "het",
  "een",
  "voor",
  "met",
  "door",
  "van",
  "naar",
  "wordt",
  "zijn",
  "niet",
  "maar",
  "deze",
  "organisatie",
  "bestuur",
]);

function uniq(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function clean(s: string): string {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function lowerClean(s: string): string {
  return clean(s).toLowerCase();
}

function extractNumbers(text: string): string[] {
  return uniq(String(text ?? "").match(/(?:€\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\b)/g) ?? []);
}

function extractRoles(text: string): string[] {
  return uniq(String(text ?? "").match(/\b(ceo|cfo|coo|chro|cto|rvb|raad van bestuur|raad van toezicht|directeur|manager|teamlead|planner|projectleider|medisch directeur|compliance officer)\b/gi) ?? []);
}

function extractNamedEntities(text: string): string[] {
  return uniq(String(text ?? "").match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g) ?? []).slice(0, 120);
}

function extractProcessTerms(text: string): string[] {
  const terms = uniq(
    String(text ?? "")
      .toLowerCase()
      .match(/\b[a-z][a-z0-9_-]{4,}\b/g) ?? []
  );

  return terms
    .filter((term) => !STOP.has(term))
    .filter((term) => /(intake|planning|dashboard|contract|wachttijd|igj|instroom|consolidatie|escalatie|doorlooptijd|capaciteit|besluit|mandaat|kpi|coalitie|onderstroom|bovenstroom)/.test(term))
    .slice(0, 160);
}

export function parseInputAnchors(context: string): string[] {
  const source = String(context ?? "");
  const anchors = [
    ...extractRoles(source),
    ...extractNamedEntities(source),
    ...extractNumbers(source),
    ...extractProcessTerms(source),
  ];

  return uniq(anchors).slice(0, 200);
}

export function extractOutputAnchors(text: string): string[] {
  return parseInputAnchors(text);
}

function containsAnchor(text: string, anchor: string): boolean {
  return lowerClean(text).includes(lowerClean(anchor));
}

export function scanOutputCoverage(text: string, anchors: string[]): {
  coverage: number;
  missing: string[];
  matched: string[];
} {
  const uniqueAnchors = uniq(anchors);
  if (!uniqueAnchors.length) {
    return { coverage: 1, missing: [], matched: [] };
  }

  const matched = uniqueAnchors.filter((anchor) => containsAnchor(text, anchor));
  const missing = uniqueAnchors.filter((anchor) => !containsAnchor(text, anchor));

  return {
    coverage: matched.length / uniqueAnchors.length,
    missing,
    matched,
  };
}

export function scanAnchors(inputText: string, outputText: string): AnchorScanResult {
  const inputAnchors = parseInputAnchors(inputText);
  const outputAnchors = extractOutputAnchors(outputText);

  const matchedInput = inputAnchors.filter((anchor) => containsAnchor(outputText, anchor));
  const matchedOutput = outputAnchors.filter((anchor) => containsAnchor(inputText, anchor));

  const sections = parseSections(outputText);
  const perSection = sections.map((section) => {
    const hits = inputAnchors.filter((anchor) => containsAnchor(section.body, anchor)).length;
    return {
      section: section.number,
      heading: section.heading,
      anchorHits: hits,
      score: inputAnchors.length ? hits / inputAnchors.length : 0,
    };
  });

  return {
    inputAnchors,
    outputAnchors,
    recall: inputAnchors.length ? matchedInput.length / inputAnchors.length : 1,
    precision: outputAnchors.length ? matchedOutput.length / outputAnchors.length : 1,
    missingInputAnchors: inputAnchors.filter((anchor) => !containsAnchor(outputText, anchor)),
    unsupportedOutputAnchors: outputAnchors.filter((anchor) => !containsAnchor(inputText, anchor)),
    perSection,
  };
}
