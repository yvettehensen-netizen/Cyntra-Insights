import type {
  StrategicCaseRecord,
  StrategicInterventionRecord,
  StrategicOutcomeRecord,
} from "./StrategicDataSchema";

const CASES_KEY = "cyntra_strategic_cases_v1";
const INTERVENTIONS_KEY = "cyntra_strategic_interventions_v1";
const OUTCOMES_KEY = "cyntra_strategic_outcomes_v1";

const casesFallback: StrategicCaseRecord[] = [];
const interventionsFallback: StrategicInterventionRecord[] = [];
const outcomesFallback: StrategicOutcomeRecord[] = [];

function storage(): Storage | null {
  try {
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  const s = storage();
  if (!s) return [...fallback];
  try {
    const raw = s.getItem(key);
    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [...fallback];
  } catch {
    return [...fallback];
  }
}

function writeArray<T>(key: string, rows: T[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(rows));
  } catch {
    // best effort persistence
  }
}

export class StrategicCaseRepository {
  listCases(): StrategicCaseRecord[] {
    const rows = readArray<StrategicCaseRecord>(CASES_KEY, casesFallback);
    casesFallback.splice(0, casesFallback.length, ...rows);
    return [...rows];
  }

  upsertCase(record: StrategicCaseRecord): void {
    const rows = this.listCases();
    const idx = rows.findIndex((item) => item.case_id === record.case_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    casesFallback.splice(0, casesFallback.length, ...rows);
    writeArray(CASES_KEY, rows);
  }

  listInterventions(): StrategicInterventionRecord[] {
    const rows = readArray<StrategicInterventionRecord>(
      INTERVENTIONS_KEY,
      interventionsFallback
    );
    interventionsFallback.splice(0, interventionsFallback.length, ...rows);
    return [...rows];
  }

  upsertIntervention(record: StrategicInterventionRecord): void {
    const rows = this.listInterventions();
    const idx = rows.findIndex((item) => item.intervention_id === record.intervention_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    interventionsFallback.splice(0, interventionsFallback.length, ...rows);
    writeArray(INTERVENTIONS_KEY, rows);
  }

  listOutcomes(): StrategicOutcomeRecord[] {
    const rows = readArray<StrategicOutcomeRecord>(OUTCOMES_KEY, outcomesFallback);
    outcomesFallback.splice(0, outcomesFallback.length, ...rows);
    return [...rows];
  }

  upsertOutcome(record: StrategicOutcomeRecord): void {
    const rows = this.listOutcomes();
    const idx = rows.findIndex((item) => item.outcome_id === record.outcome_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    outcomesFallback.splice(0, outcomesFallback.length, ...rows);
    writeArray(OUTCOMES_KEY, rows);
  }

  findSimilarCases(input: { sector: string; dominant_problem: string; topK?: number }): StrategicCaseRecord[] {
    const topK = Math.max(1, Math.min(10, Number(input.topK ?? 5)));
    const sector = String(input.sector ?? "").toLowerCase();
    const problem = String(input.dominant_problem ?? "").toLowerCase();

    const scored = this.listCases().map((row) => {
      let score = 0;
      if (sector && row.sector.toLowerCase() === sector) score += 2;
      if (problem && row.dominant_problem.toLowerCase().includes(problem.slice(0, 30))) score += 2;
      if (problem && problem.includes("contract") && /contract|plafond|tarief/i.test(row.dominant_problem)) score += 1;
      return { row, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.row);
  }
}
