import {
  StrategicMemoryStore,
  type StrategicCase,
  type StrategicCaseEmbedding,
} from "./StrategicMemoryStore";

export type StrategicRetrievalQuery = {
  probleemtype: string;
  sector: string;
  strategische_inzichten: string[];
  mechanismen: string[];
  top_k?: number;
};

export type RetrievedStrategicCase = {
  case: StrategicCase;
  similarity: number;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .toLowerCase()
    .split(/[^a-z0-9à-ÿ]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function embedText(value: string, dimensions = 64): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const tokens = tokenize(value);
  if (!tokens.length) return vector;

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0));
  if (norm === 0) return vector;
  return vector.map((item) => item / norm);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function sourceFromCase(row: StrategicCase): string {
  return [
    row.organisatie_type,
    row.sector,
    row.organisatiegrootte,
    row.dominant_problem,
    row.dominant_thesis,
    row.mechanisms.join(" "),
    row.strategic_options.join(" "),
    row.gekozen_strategie,
    row.interventieprogramma,
    row.resultaat ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export class StrategicMemoryRetriever {
  constructor(private readonly store = new StrategicMemoryStore()) {}

  buildEmbeddingSource(query: StrategicRetrievalQuery): string {
    return [
      query.probleemtype,
      query.sector,
      query.strategische_inzichten.join(" "),
      query.mechanismen.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  buildEmbedding(source: string): number[] {
    return embedText(source);
  }

  buildCaseEmbedding(caseRecord: StrategicCase): StrategicCaseEmbedding {
    const embeddingSource = sourceFromCase(caseRecord);
    return {
      case_id: caseRecord.case_id,
      vector: embedText(embeddingSource),
      embedding_source: embeddingSource,
    };
  }

  retrieveSimilarCases(query: StrategicRetrievalQuery): RetrievedStrategicCase[] {
    const topK = Math.max(1, Math.min(10, Number(query.top_k ?? 5)));
    const querySource = this.buildEmbeddingSource(query);
    if (!querySource) return [];

    const queryVector = this.buildEmbedding(querySource);
    const cases = this.store.listCases();
    const embeddings = this.store.listEmbeddings();
    const byCaseId = new Map(cases.map((item) => [item.case_id, item]));

    const scored = embeddings
      .map((item) => {
        const caseRecord = byCaseId.get(item.case_id);
        if (!caseRecord) return null;
        return {
          case: caseRecord,
          similarity: cosineSimilarity(queryVector, item.vector),
        };
      })
      .filter((item): item is RetrievedStrategicCase => item !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return scored;
  }
}
