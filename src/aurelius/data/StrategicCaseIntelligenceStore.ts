import type { CaseDatasetRecord } from "./StrategicDataset";

const KEY = "cyntra_aurelius_case_intelligence_dataset_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(): CaseDatasetRecord[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CaseDatasetRecord[]) : [];
  } catch {
    return [];
  }
}

function write(rows: CaseDatasetRecord[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(rows));
  } catch {
    // best effort
  }
}

export class StrategicCaseIntelligenceStore {
  list(): CaseDatasetRecord[] {
    return read();
  }

  private isValid(record: CaseDatasetRecord): boolean {
    return Boolean(
      String(record?.case_id ?? "").trim() &&
        String(record?.organisation_name ?? "").trim() &&
        String(record?.sector ?? "").trim() &&
        String(record?.probleemtype ?? "").trim() &&
        String(record?.dominante_these ?? "").trim() &&
        String(record?.gekozen_strategie ?? "").trim() &&
        String(record?.interventie ?? "").trim()
    );
  }

  upsert(record: CaseDatasetRecord): void {
    if (!this.isValid(record)) return;
    const rows = this.list();
    const idx = rows.findIndex((row) => row.case_id === record.case_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    write(rows);
  }
}
