type CaseIntervention = {
  id: string;
  title: string;
  description: string;
  impact?: string;
  risk?: string;
  confidence?: number;
};

export type StrategicCaseSnapshot = {
  case_id: string;
  session_id?: string;
  organization_id?: string;
  organisation_name?: string;
  sector: string;
  probleemtype?: string;
  dominante_these?: string;
  gekozen_strategie?: string;
  analyse_input: string;
  report: string;
  interventions: CaseIntervention[];
  confidence: number;
  created_at: string;
  updated_at: string;
};

const KEY = "cyntra_case_store_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(): StrategicCaseSnapshot[] {
  const ref = storage();
  if (!ref) return [];
  try {
    const raw = ref.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StrategicCaseSnapshot[]) : [];
  } catch {
    return [];
  }
}

function write(rows: StrategicCaseSnapshot[]): void {
  const ref = storage();
  if (!ref) return;
  try {
    ref.setItem(KEY, JSON.stringify(rows));
  } catch {
    // best effort persistence
  }
}

class CaseStore {
  getAll(): StrategicCaseSnapshot[] {
    return read().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  }

  get(case_id: string): StrategicCaseSnapshot | null {
    return this.getAll().find((row) => row.case_id === case_id) ?? null;
  }

  upsert(record: StrategicCaseSnapshot): StrategicCaseSnapshot {
    const rows = this.getAll();
    const idx = rows.findIndex((row) => row.case_id === record.case_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    write(rows);
    return record;
  }

  clear(): void {
    write([]);
  }
}

export { CaseStore };
export const caseStore = new CaseStore();
