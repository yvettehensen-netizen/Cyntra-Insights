import type { StrategicOutcomeRecord } from "./StrategicDataSchema";

const KEY = "cyntra_aurelius_outcome_store_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(): StrategicOutcomeRecord[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StrategicOutcomeRecord[]) : [];
  } catch {
    return [];
  }
}

function write(rows: StrategicOutcomeRecord[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(rows));
  } catch {
    // best effort
  }
}

export class StrategicOutcomeStore {
  list(): StrategicOutcomeRecord[] {
    return read();
  }

  upsert(record: StrategicOutcomeRecord): void {
    const rows = this.list();
    const idx = rows.findIndex((row) => row.outcome_id === record.outcome_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    write(rows);
  }
}
