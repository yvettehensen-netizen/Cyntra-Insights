export type StrategicCase = {
  case_id: string;
  created_at: string;
  organisatie_type: string;
  sector: string;
  organisatiegrootte: string;
  dominant_problem: string;
  dominant_thesis: string;
  mechanisms: string[];
  strategic_options: string[];
  gekozen_strategie: string;
  interventieprogramma: string;
  resultaat?: string;
};

export type StrategicCaseEmbedding = {
  case_id: string;
  vector: number[];
  embedding_source: string;
};

export type StrategicOutcomeSnapshot = {
  case_id: string;
  outcome_id: string;
  outcome_summary: string;
  outcome_score: "laag" | "middel" | "hoog";
  evaluation_date: string;
};

const STRATEGIC_CASES_KEY = "strategic_case_store";
const STRATEGIC_CASE_EMBEDDINGS_KEY = "strategic_case_embeddings";
const STRATEGIC_OUTCOMES_KEY = "decision_outcomes";

const strategicCaseFallback: StrategicCase[] = [];
const strategicEmbeddingFallback: StrategicCaseEmbedding[] = [];
const strategicOutcomeFallback: StrategicOutcomeSnapshot[] = [];

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  const storage = getLocalStorage();
  if (!storage) return [...fallback];
  try {
    const raw = storage.getItem(key);
    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...fallback];
    return parsed as T[];
  } catch {
    return [...fallback];
  }
}

function writeArray<T>(key: string, value: T[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort persistence
  }
}

export class StrategicMemoryStore {
  listCases(): StrategicCase[] {
    const records = readArray<StrategicCase>(STRATEGIC_CASES_KEY, strategicCaseFallback);
    strategicCaseFallback.splice(0, strategicCaseFallback.length, ...records);
    return [...records];
  }

  upsertCase(caseRecord: StrategicCase): void {
    const cases = this.listCases();
    const index = cases.findIndex((row) => row.case_id === caseRecord.case_id);
    if (index >= 0) {
      cases[index] = caseRecord;
    } else {
      cases.push(caseRecord);
    }
    strategicCaseFallback.splice(0, strategicCaseFallback.length, ...cases);
    writeArray(STRATEGIC_CASES_KEY, cases);
  }

  listEmbeddings(): StrategicCaseEmbedding[] {
    const rows = readArray<StrategicCaseEmbedding>(
      STRATEGIC_CASE_EMBEDDINGS_KEY,
      strategicEmbeddingFallback
    );
    strategicEmbeddingFallback.splice(0, strategicEmbeddingFallback.length, ...rows);
    return [...rows];
  }

  upsertEmbedding(embedding: StrategicCaseEmbedding): void {
    const rows = this.listEmbeddings();
    const index = rows.findIndex((row) => row.case_id === embedding.case_id);
    if (index >= 0) {
      rows[index] = embedding;
    } else {
      rows.push(embedding);
    }
    strategicEmbeddingFallback.splice(0, strategicEmbeddingFallback.length, ...rows);
    writeArray(STRATEGIC_CASE_EMBEDDINGS_KEY, rows);
  }

  listOutcomes(): StrategicOutcomeSnapshot[] {
    const rows = readArray<StrategicOutcomeSnapshot>(STRATEGIC_OUTCOMES_KEY, strategicOutcomeFallback);
    strategicOutcomeFallback.splice(0, strategicOutcomeFallback.length, ...rows);
    return [...rows];
  }

  upsertOutcome(outcome: StrategicOutcomeSnapshot): void {
    const rows = this.listOutcomes();
    const index = rows.findIndex((row) => row.outcome_id === outcome.outcome_id);
    if (index >= 0) rows[index] = outcome;
    else rows.push(outcome);
    strategicOutcomeFallback.splice(0, strategicOutcomeFallback.length, ...rows);
    writeArray(STRATEGIC_OUTCOMES_KEY, rows);
  }
}
