import type { StrategicHypothesis } from "./HypothesisGenerator";

export type HypothesisCompetitionInput = {
  hypotheses: StrategicHypothesis[];
  contextText: string;
  memoryText: string;
  graphText: string;
};

export type CompetitiveHypothesis = StrategicHypothesis & {
  evidenceFor: string[];
  evidenceAgainst: string[];
  supportScore: number;
  contradictionScore: number;
};

const HYPOTHESIS_KEYWORDS: Record<string, string[]> = {
  H1: ["contract", "plafond", "tarief", "marge", "kostprijs", "loonkosten", "verlies"],
  H2: ["mandaat", "besluit", "weerstand", "conflict", "governance", "uitstel", "onderstroom"],
  H3: ["prioriteit", "parallel", "initiatief", "scope", "focus", "versnippering", "stopregel"],
  H4: ["markt", "instroom", "verwijzer", "concurrent", "vraag", "kanaal"],
};

function sentenceSplit(text: string): string[] {
  return String(text ?? "")
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function collectEvidence(source: string, keywords: string[]): string[] {
  const sentences = sentenceSplit(source);
  const hits = sentences.filter((s) =>
    keywords.some((k) => s.toLowerCase().includes(k.toLowerCase()))
  );
  return hits.slice(0, 4);
}

function collectCounterEvidence(source: string, keywords: string[]): string[] {
  const sentences = sentenceSplit(source);
  const hits = sentences.filter((s) =>
    /(geen|ontbreekt|niet|onduidelijk|beperkt|laag|zwak)/i.test(s) &&
    keywords.some((k) => s.toLowerCase().includes(k.toLowerCase()))
  );
  return hits.slice(0, 3);
}

export function runHypothesisCompetition(
  input: HypothesisCompetitionInput
): CompetitiveHypothesis[] {
  const context = String(input.contextText ?? "");
  const memory = String(input.memoryText ?? "");
  const graph = String(input.graphText ?? "");
  const merged = `${context}\n${memory}\n${graph}`;

  return input.hypotheses.map((h) => {
    const keywords = HYPOTHESIS_KEYWORDS[h.id] ?? h.hypothesis.toLowerCase().split(/\s+/).slice(0, 6);
    const evidenceFor = collectEvidence(merged, keywords);
    const evidenceAgainst = collectCounterEvidence(merged, keywords);

    const supportScore = Math.min(1, evidenceFor.length / 4);
    const contradictionScore = Math.min(1, evidenceAgainst.length / 3);

    return {
      ...h,
      evidenceFor,
      evidenceAgainst,
      supportScore,
      contradictionScore,
    };
  });
}
