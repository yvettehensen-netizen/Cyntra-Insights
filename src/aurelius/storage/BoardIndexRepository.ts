import type { BoardIndexResult } from "@/aurelius/governance/BoardLegitimacyEngine";

export type BoardIndexSnapshot = BoardIndexResult & {
  analysisId: string;
  createdAt: string;
  organisationId?: string;
};

const STORAGE_KEY = "cyntra.board_index.snapshots.v1";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readAll(): BoardIndexSnapshot[] {
  if (typeof localStorage === "undefined") return [];
  return safeParse<BoardIndexSnapshot[]>(
    localStorage.getItem(STORAGE_KEY),
    []
  );
}

function writeAll(rows: BoardIndexSnapshot[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

async function tryBackendSave(snapshot: BoardIndexSnapshot): Promise<boolean> {
  try {
    const response = await fetch("/api/board-index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function tryBackendLoad(analysisId: string): Promise<BoardIndexSnapshot | null> {
  try {
    const response = await fetch(`/api/board-index/${encodeURIComponent(analysisId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as BoardIndexSnapshot;
    return json;
  } catch {
    return null;
  }
}

export async function saveBoardIndexSnapshot(
  snapshot: BoardIndexSnapshot
): Promise<void> {
  const rows = readAll();
  rows.unshift(snapshot);
  writeAll(rows.slice(0, 500));
  await tryBackendSave(snapshot);
}

export async function getBoardIndexSnapshot(
  analysisId: string
): Promise<BoardIndexSnapshot | null> {
  const backend = await tryBackendLoad(analysisId);
  if (backend) return backend;
  const rows = readAll();
  return rows.find((row) => row.analysisId === analysisId) ?? null;
}

export async function getBoardIndexHistory(args?: {
  analysisId?: string;
  organisationId?: string;
  days?: number;
}): Promise<BoardIndexSnapshot[]> {
  const now = Date.now();
  const maxAgeDays = Math.max(1, Number(args?.days ?? 365));
  const minTs = now - maxAgeDays * 24 * 60 * 60 * 1000;
  return readAll().filter((row) => {
    if (args?.analysisId && row.analysisId !== args.analysisId) return false;
    if (args?.organisationId && row.organisationId !== args.organisationId) return false;
    const ts = new Date(row.createdAt).getTime();
    return Number.isFinite(ts) ? ts >= minTs : false;
  });
}

