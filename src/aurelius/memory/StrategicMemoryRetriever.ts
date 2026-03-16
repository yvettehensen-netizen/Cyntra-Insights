import { StrategicMemoryIndexer } from "./StrategicMemoryIndexer";
import { StrategicMemoryStore, type StrategicCaseRecord } from "./StrategicMemoryStore";

export type StrategicMemoryRetrievalInput = {
  sector: string;
  problemType: string;
  strategicInsights: string[];
  topK?: number;
};

export type RetrievedStrategicCase = {
  caseRecord: StrategicCaseRecord;
  similarityScore: number;
};

export class StrategicMemoryRetriever {
  constructor(
    private readonly store = new StrategicMemoryStore(),
    private readonly indexer = new StrategicMemoryIndexer()
  ) {}

  retrieveSimilarCases(input: StrategicMemoryRetrievalInput): RetrievedStrategicCase[] {
    const query = [input.sector, input.problemType, input.strategicInsights.join(" ")]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!query) return [];

    const candidates = this.indexer.querySimilar(query, input.topK ?? 5);
    if (!candidates.length) return [];

    const byId = new Map(this.store.listCases().map((c) => [c.caseId, c]));
    return candidates
      .map((c) => {
        const caseRecord = byId.get(c.caseId);
        if (!caseRecord) return null;
        return { caseRecord, similarityScore: c.score };
      })
      .filter((v): v is RetrievedStrategicCase => v !== null);
  }
}
