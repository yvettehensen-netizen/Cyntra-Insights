import type { Sector } from "@/aurelius/sector/types";

export type SectorSignalsResponse = {
  sector: Sector;
  signals: string[];
  sources: string[];
  fetchedAt: string;
  source: "live" | "cache" | "fallback";
  sectorRiskIndex: number;
  regulatorPressureIndex: number;
  contractPowerScore: number;
  arbeidsmarktdrukIndex: number;
  rubric: Record<string, string>;
};

export async function fetchSectorSignals(sector: Sector): Promise<SectorSignalsResponse | null> {
  try {
    const response = await fetch(`/api/sector/signals?sector=${encodeURIComponent(sector)}`);
    if (!response.ok) return null;
    return (await response.json()) as SectorSignalsResponse;
  } catch {
    return null;
  }
}
