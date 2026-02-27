import type { Sector } from "@/aurelius/sector/types";

type SectorCacheEntry = {
  fetchedAt: string;
  expiresAtEpochMs: number;
  payload: unknown;
};

const inMemoryCache = new Map<Sector, SectorCacheEntry>();
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function readSectorCache<T>(sector: Sector): T | null {
  const hit = inMemoryCache.get(sector);
  if (!hit) return null;
  if (Date.now() > hit.expiresAtEpochMs) {
    inMemoryCache.delete(sector);
    return null;
  }
  return hit.payload as T;
}

export function writeSectorCache<T>(sector: Sector, payload: T): void {
  inMemoryCache.set(sector, {
    fetchedAt: new Date().toISOString(),
    expiresAtEpochMs: Date.now() + ONE_WEEK_MS,
    payload,
  });
}

export function clearSectorCache(): void {
  inMemoryCache.clear();
}
