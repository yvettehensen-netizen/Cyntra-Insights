import type { Sector } from "@/aurelius/sector/types";
import { getSectorSignals } from "@/aurelius/sector/sectorSignals";

export type SectorSignalsResponse = {
  sector: Sector;
  signals: string[];
  fetchedAt: string;
  source: "cache" | "curated" | "fallback";
  sectorRiskIndex: number;
  regulatorPressureIndex: number;
  contractPowerScore: number;
  arbeidsmarktdrukIndex: number;
  rubric: Record<string, string>;
};

export async function fetchSectorSignals(sector: Sector): Promise<SectorSignalsResponse | null> {
  const endpointEnabled = String(import.meta.env.VITE_SECTOR_ENDPOINT_ENABLED ?? "false") === "true";

  if (!endpointEnabled) {
    const local = await getSectorSignals(sector);
    return {
      ...local,
      source: local.source || "fallback",
    };
  }

  try {
    const response = await fetch(`/api/sector/signals?sector=${encodeURIComponent(sector)}`);
    if (!response.ok) {
      const local = await getSectorSignals(sector);
      return { ...local, source: "fallback" };
    }
    return (await response.json()) as SectorSignalsResponse;
  } catch {
    const local = await getSectorSignals(sector);
    return { ...local, source: "fallback" };
  }
}
