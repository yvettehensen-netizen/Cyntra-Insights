import type { InterventionDatasetRecord } from "./StrategicDataset";

const KEY = "cyntra_aurelius_intervention_dataset_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(): InterventionDatasetRecord[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InterventionDatasetRecord[]) : [];
  } catch {
    return [];
  }
}

function write(rows: InterventionDatasetRecord[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(rows));
  } catch {
    // best effort
  }
}

export class InterventionStore {
  list(): InterventionDatasetRecord[] {
    return read();
  }

  private isValid(record: InterventionDatasetRecord): boolean {
    return Boolean(
      String(record?.intervention_id ?? "").trim() &&
        String(record?.sector ?? "").trim() &&
        String(record?.probleemtype ?? "").trim() &&
        String(record?.interventie ?? "").trim() &&
        Number.isFinite(record?.succes_score) &&
        Number(record.succes_score) >= 0 &&
        Number(record.succes_score) <= 1
    );
  }

  upsert(record: InterventionDatasetRecord): void {
    if (!this.isValid(record)) return;
    const rows = this.list();
    const idx = rows.findIndex((row) => row.intervention_id === record.intervention_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    write(rows);
  }
}
