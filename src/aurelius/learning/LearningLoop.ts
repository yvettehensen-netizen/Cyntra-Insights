import type { StrategicCaseSnapshot } from "@/aurelius/cases/CaseStore";
import type { Intervention } from "@/aurelius/interventions/types";
import { BenchmarkEngine, SectorPatternEngine, StrategicSignalEngine } from "@/aurelius/network";

type LearningSnapshot = {
  updated_at: string;
  cases: number;
  interventions: number;
  sector_patterns: number;
  signals: number;
  benchmark_risk: number;
};

const KEY = "cyntra_learning_loop_snapshot_v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: LearningSnapshot): void {
  const ref = storage();
  if (!ref) return;
  try {
    ref.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // best effort persistence
  }
}

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export class LearningLoop {
  readonly name = "Learning Loop";

  feed(cases: StrategicCaseSnapshot[], interventions: Intervention[]): LearningSnapshot {
    const records = cases.map((item, idx) => ({
      dataset_id: normalize(item.case_id || `dataset-${idx + 1}`),
      sector: normalize(item.sector) || "Onbekende sector",
      probleemtype: normalize(item.probleemtype) || "overig",
      mechanismen: [],
      interventies: interventions
        .filter((row) => normalize(row.source_case_id) === normalize(item.case_id))
        .map((row) => normalize(row.title || row.description))
        .filter(Boolean),
      outcomes: [],
      created_at: item.created_at,
    }));

    const sectorPatterns = new SectorPatternEngine().detect(records);
    const signals = new StrategicSignalEngine().detect(records);
    const benchmark = new BenchmarkEngine().compare(records);

    const snapshot: LearningSnapshot = {
      updated_at: new Date().toISOString(),
      cases: cases.length,
      interventions: interventions.length,
      sector_patterns: sectorPatterns.length,
      signals: signals.length,
      benchmark_risk: benchmark.gemiddelden.risico,
    };
    writeSnapshot(snapshot);
    return snapshot;
  }
}
