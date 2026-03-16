import type { StrategicDatasetRecord } from "@/aurelius/data/StrategicDataset";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type SectorPattern = {
  sector: string;
  patroon: string;
  waar_dit_voorkomt: number;
  strategische_implicatie: string;
};

export type SectorPatternEngineOutput = {
  sectorpatronen: SectorPattern[];
  strategische_spanningen: string[];
  succesvolle_strategieen: Array<{ strategie: string; frequentie: number }>;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function topCounts(values: string[]): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const value of values) {
    const key = normalize(value);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export class SectorPatternEngine {
  readonly name = "Sector Pattern Engine";

  detect(records: StrategicDatasetRecord[], sector?: string): SectorPattern[] {
    const scoped = records.filter((record) => {
      if (!sector) return true;
      return normalize(record.sector).toLowerCase() === normalize(sector).toLowerCase();
    });

    const probleemTop = topCounts(scoped.map((item) => item.probleemtype));
    const interventieTop = topCounts(scoped.flatMap((item) => item.interventies));

    const patterns: SectorPattern[] = [];

    for (const item of probleemTop) {
      patterns.push({
        sector: sector || "Alle sectoren",
        patroon: item.label,
        waar_dit_voorkomt: item.count,
        strategische_implicatie: `Dit probleemtype vraagt prioriteit in besluitvorming en interventieontwerp (${item.count} cases).`,
      });
    }

    for (const item of interventieTop.slice(0, 2)) {
      patterns.push({
        sector: sector || "Alle sectoren",
        patroon: `Interventiepatroon: ${item.label}`,
        waar_dit_voorkomt: item.count,
        strategische_implicatie: `Deze interventie komt frequent voor en kan als referentie dienen (${item.count} cases).`,
      });
    }

    return patterns.slice(0, 7);
  }

  detectIntelligence(records: StrategicDatasetRecord[], sector?: string): SectorPatternEngineOutput {
    const scoped = records.filter((record) => {
      if (!sector) return true;
      return normalize(record.sector).toLowerCase() === normalize(sector).toLowerCase();
    });

    const sectorpatronen = this.detect(records, sector);
    const strategische_spanningen = topCounts(scoped.flatMap((item) => item.mechanismen))
      .slice(0, 3)
      .map((item) => `Spanning rond ${item.label} (${item.count} cases)`);
    const succesvolle_strategieen = topCounts(scoped.flatMap((item) => item.interventies))
      .slice(0, 3)
      .map((item) => ({ strategie: item.label, frequentie: item.count }));

    return {
      sectorpatronen,
      strategische_spanningen,
      succesvolle_strategieen,
    };
  }

  analyzeStandard(records: StrategicDatasetRecord[], sector?: string): StrategicEngineResult {
    const intelligence = this.detectIntelligence(records, sector);
    return {
      insights: uniqueLines(intelligence.sectorpatronen.map((item) => item.patroon)),
      risks: uniqueLines(intelligence.strategische_spanningen),
      opportunities: uniqueLines(
        intelligence.succesvolle_strategieen.map(
          (item) => `${item.strategie} (${item.frequentie})`
        )
      ),
      recommendations: uniqueLines(
        intelligence.sectorpatronen.map((item) => item.strategische_implicatie)
      ),
      confidence: clampConfidence(intelligence.sectorpatronen.length >= 3 ? 0.72 : 0.57),
    };
  }
}
