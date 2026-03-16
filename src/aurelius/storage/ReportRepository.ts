import type { StoredReport } from "@/aurelius/models/StoredReport";

const LS_KEY = "cyntra.stored_reports.v1";
const DB_NAME = "cyntra_report_db";
const STORE = "reports";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readLocal(): StoredReport[] {
  if (typeof localStorage === "undefined") return [];
  return safeParse<StoredReport[]>(localStorage.getItem(LS_KEY), []);
}

function writeLocal(rows: StoredReport[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

function sortByDateDesc(rows: StoredReport[]): StoredReport[] {
  return [...rows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("date", "date", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function saveIndexed(report: StoredReport): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(report);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function getIndexedAll(): Promise<StoredReport[] | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []) as StoredReport[]);
    req.onerror = () => resolve(null);
  });
}

async function getIndexedById(id: string): Promise<StoredReport | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as StoredReport | undefined) || null);
    req.onerror = () => resolve(null);
  });
}

async function tryBackendSave(report: StoredReport): Promise<boolean> {
  try {
    const response = await fetch("/api/reports-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function tryBackendList(): Promise<StoredReport[] | null> {
  try {
    const response = await fetch("/api/reports-storage", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { reports?: StoredReport[] };
    return Array.isArray(json?.reports) ? json.reports : [];
  } catch {
    return null;
  }
}

async function tryBackendById(id: string): Promise<StoredReport | null> {
  try {
    const response = await fetch(`/api/reports-storage/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as StoredReport;
  } catch {
    return null;
  }
}

export async function saveReport(report: StoredReport): Promise<void> {
  const localRows = readLocal().filter((row) => row.id !== report.id);
  localRows.unshift(report);
  writeLocal(sortByDateDesc(localRows).slice(0, 1000));

  await saveIndexed(report).catch(() => false);
  await tryBackendSave(report).catch(() => false);
}

export async function getReports(): Promise<StoredReport[]> {
  const backend = await tryBackendList();
  if (backend && backend.length) return sortByDateDesc(backend);

  const indexed = await getIndexedAll();
  if (indexed && indexed.length) return sortByDateDesc(indexed);

  return sortByDateDesc(readLocal());
}

export async function getReportById(id: string): Promise<StoredReport | null> {
  const backend = await tryBackendById(id);
  if (backend) return backend;

  const indexed = await getIndexedById(id);
  if (indexed) return indexed;

  return readLocal().find((row) => row.id === id) ?? null;
}

