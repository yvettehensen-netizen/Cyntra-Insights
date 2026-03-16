export type DecisionStatus = "actief" | "gemonitord" | "afgerond";

export type DecisionRecord = {
  decision_id: string;
  session_id: string;
  organization: string;
  decision: string;
  chosen_option: string;
  date: string;
  owner: string;
  status: DecisionStatus;
};

const STORAGE_KEY = "cyntra_decision_registry_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRows(): DecisionRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DecisionRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRows(rows: DecisionRecord[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const DecisionRegistry = {
  list(): DecisionRecord[] {
    return readRows().sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  getBySession(sessionId: string): DecisionRecord | null {
    return readRows().find((row) => row.session_id === sessionId) || null;
  },
  upsert(record: DecisionRecord): DecisionRecord {
    const rows = readRows();
    const next = [record, ...rows.filter((row) => row.decision_id !== record.decision_id)];
    writeRows(next);
    return record;
  },
};
