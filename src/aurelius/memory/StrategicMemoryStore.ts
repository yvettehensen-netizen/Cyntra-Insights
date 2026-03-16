export type StrategicCaseRecord = {
  caseId: string;
  createdAt: string;
  sector: string;
  organizationSize: string;
  keyProblem: string;
  dominantThesis: string;
  strategicInsights: string[];
  chosenStrategy: string;
  interventionProgram: string;
  resultSummary?: string;
};

export type InterventionMemoryRecord = {
  interventionId: string;
  caseId: string;
  problemType: string;
  intervention: string;
  sector: string;
  result: string;
};

export type StrategicPatternMemoryRecord = {
  memoryId: string;
  createdAt: string;
  sector: string;
  organizationType: string;
  dominantProblem: string;
  dominantParadox?: string;
  recommendedStrategy: string;
  keyRisks?: string[];
  leveragePoints: string[];
  blindSpots: string[];
  interventions: string[];
};

const STRATEGIC_CASES_KEY = "strategic_cases";
const INTERVENTION_MEMORY_KEY = "strategic_interventions";
const STRATEGIC_PATTERN_MEMORY_KEY = "strategic_pattern_memory";
const strategicCasesFallback: StrategicCaseRecord[] = [];
const interventionMemoryFallback: InterventionMemoryRecord[] = [];
const strategicPatternMemoryFallback: StrategicPatternMemoryRecord[] = [];

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  const storage = getLocalStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeArray<T>(key: string, value: T[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op: persistence best effort
  }
}

export class StrategicMemoryStore {
  addCase(record: StrategicCaseRecord): void {
    const cases = this.listCases();
    const index = cases.findIndex((c) => c.caseId === record.caseId);
    if (index >= 0) {
      cases[index] = record;
    } else {
      cases.push(record);
    }
    strategicCasesFallback.splice(0, strategicCasesFallback.length, ...cases);
    writeArray(STRATEGIC_CASES_KEY, cases);
  }

  listCases(): StrategicCaseRecord[] {
    const rows = readArray(STRATEGIC_CASES_KEY, strategicCasesFallback);
    if (!rows.length && strategicCasesFallback.length) {
      return [...strategicCasesFallback];
    }
    strategicCasesFallback.splice(0, strategicCasesFallback.length, ...rows);
    return [...rows];
  }

  addIntervention(record: InterventionMemoryRecord): void {
    const interventions = this.listInterventions();
    const index = interventions.findIndex((i) => i.interventionId === record.interventionId);
    if (index >= 0) {
      interventions[index] = record;
    } else {
      interventions.push(record);
    }
    interventionMemoryFallback.splice(0, interventionMemoryFallback.length, ...interventions);
    writeArray(INTERVENTION_MEMORY_KEY, interventions);
  }

  listInterventions(): InterventionMemoryRecord[] {
    const rows = readArray(INTERVENTION_MEMORY_KEY, interventionMemoryFallback);
    if (!rows.length && interventionMemoryFallback.length) {
      return [...interventionMemoryFallback];
    }
    interventionMemoryFallback.splice(0, interventionMemoryFallback.length, ...rows);
    return [...rows];
  }

  upsertStrategicPattern(record: StrategicPatternMemoryRecord): void {
    const rows = this.listStrategicPatterns();
    const index = rows.findIndex((row) => row.memoryId === record.memoryId);
    if (index >= 0) {
      rows[index] = record;
    } else {
      rows.push(record);
    }
    strategicPatternMemoryFallback.splice(0, strategicPatternMemoryFallback.length, ...rows);
    writeArray(STRATEGIC_PATTERN_MEMORY_KEY, rows);
  }

  listStrategicPatterns(): StrategicPatternMemoryRecord[] {
    const rows = readArray(STRATEGIC_PATTERN_MEMORY_KEY, strategicPatternMemoryFallback);
    if (!rows.length && strategicPatternMemoryFallback.length) {
      return [...strategicPatternMemoryFallback];
    }
    strategicPatternMemoryFallback.splice(0, strategicPatternMemoryFallback.length, ...rows);
    return [...rows];
  }
}
