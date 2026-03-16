import type { StrategicCaseRecord } from "./StrategicDataSchema";

const KEY = "cyntra_aurelius_case_store_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(): StrategicCaseRecord[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StrategicCaseRecord[]) : [];
  } catch {
    return [];
  }
}

function write(rows: StrategicCaseRecord[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(rows));
  } catch {
    // best effort
  }
}

export class StrategicCaseStore {
  list(): StrategicCaseRecord[] {
    return read();
  }

  upsert(record: StrategicCaseRecord): void {
    const rows = this.list();
    const idx = rows.findIndex((row) => row.case_id === record.case_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    write(rows);
  }
}
