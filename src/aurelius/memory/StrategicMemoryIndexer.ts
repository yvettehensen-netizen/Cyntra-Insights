import type { StrategicCaseRecord } from "./StrategicMemoryStore";

export type StrategicCaseEmbeddingRecord = {
  caseId: string;
  embedding: number[];
  sourceText: string;
};

const STRATEGIC_EMBEDDINGS_KEY = "strategic_case_embeddings";
const strategicCaseEmbeddingsFallback: StrategicCaseEmbeddingRecord[] = [];

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function readEmbeddings(): StrategicCaseEmbeddingRecord[] {
  const storage = getLocalStorage();
  if (!storage) return [...strategicCaseEmbeddingsFallback];
  try {
    const raw = storage.getItem(STRATEGIC_EMBEDDINGS_KEY);
    if (!raw) return [...strategicCaseEmbeddingsFallback];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...strategicCaseEmbeddingsFallback];
    strategicCaseEmbeddingsFallback.splice(
      0,
      strategicCaseEmbeddingsFallback.length,
      ...(parsed as StrategicCaseEmbeddingRecord[])
    );
    return [...strategicCaseEmbeddingsFallback];
  } catch {
    return [...strategicCaseEmbeddingsFallback];
  }
}

function writeEmbeddings(rows: StrategicCaseEmbeddingRecord[]): void {
  strategicCaseEmbeddingsFallback.splice(0, strategicCaseEmbeddingsFallback.length, ...rows);
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STRATEGIC_EMBEDDINGS_KEY, JSON.stringify(rows));
  } catch {
    // no-op: persistence best effort
  }
}

function tokenize(text: string): string[] {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function toVector(tokens: string[], size = 128): number[] {
  const vec = new Array(size).fill(0);
  for (const token of tokens) {
    let h = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % size;
    vec[idx] += 1;
  }
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class StrategicMemoryIndexer {
  buildCaseEmbedding(caseRecord: StrategicCaseRecord): StrategicCaseEmbeddingRecord {
    const sourceText = [
      caseRecord.sector,
      caseRecord.keyProblem,
      caseRecord.dominantThesis,
      caseRecord.strategicInsights.join(" "),
      caseRecord.chosenStrategy,
    ]
      .filter(Boolean)
      .join(" ");
    const embedding = toVector(tokenize(sourceText));
    return {
      caseId: caseRecord.caseId,
      embedding,
      sourceText,
    };
  }

  indexCase(caseRecord: StrategicCaseRecord): StrategicCaseEmbeddingRecord {
    const embeddingRecord = this.buildCaseEmbedding(caseRecord);
    const rows = readEmbeddings();
    const index = rows.findIndex((r) => r.caseId === embeddingRecord.caseId);
    if (index >= 0) {
      rows[index] = embeddingRecord;
    } else {
      rows.push(embeddingRecord);
    }
    writeEmbeddings(rows);
    return embeddingRecord;
  }

  listIndexedCases(): StrategicCaseEmbeddingRecord[] {
    return readEmbeddings();
  }

  querySimilar(queryText: string, topK = 5): Array<{ caseId: string; score: number }> {
    const queryEmbedding = toVector(tokenize(queryText));
    return readEmbeddings()
      .map((item) => ({
        caseId: item.caseId,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, topK));
  }
}
