import type { SupabaseClient } from "@supabase/supabase-js";
import type { StrategicPatternMemoryRecord } from "@/aurelius/memory/StrategicMemoryStore";
import { StrategicMemoryStore } from "@/aurelius/memory/StrategicMemoryStore";

const TABLE_NAME = "aurelius_strategic_memory";

export class StrategicMemoryRepository {
  constructor(
    private readonly deps: {
      supabase?: SupabaseClient | null;
      localStore?: StrategicMemoryStore;
    } = {}
  ) {}

  async listPatterns(): Promise<StrategicPatternMemoryRecord[]> {
    if (this.deps.supabase) {
      const { data, error } = await this.deps.supabase
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        return data.map((row) => this.toMemoryRecord(row));
      }
    }
    return (this.deps.localStore ?? new StrategicMemoryStore()).listStrategicPatterns();
  }

  async upsertPattern(record: StrategicPatternMemoryRecord): Promise<void> {
    if (this.deps.supabase) {
      const { error } = await this.deps.supabase.from(TABLE_NAME).upsert(this.toDatabaseRecord(record), {
        onConflict: "memory_id",
      });
      if (!error) return;
    }
    (this.deps.localStore ?? new StrategicMemoryStore()).upsertStrategicPattern(record);
  }

  private toDatabaseRecord(record: StrategicPatternMemoryRecord): Record<string, unknown> {
    return {
      memory_id: record.memoryId,
      created_at: record.createdAt,
      sector: record.sector,
      organization_type: record.organizationType,
      dominant_problem: record.dominantProblem,
      dominant_paradox: record.dominantParadox ?? null,
      recommended_strategy: record.recommendedStrategy,
      key_risks: record.keyRisks ?? [],
      leverage_points: record.leveragePoints,
      blind_spots: record.blindSpots,
      interventions: record.interventions,
    };
  }

  private toMemoryRecord(row: Record<string, unknown>): StrategicPatternMemoryRecord {
    return {
      memoryId: String(row.memory_id ?? ""),
      createdAt: String(row.created_at ?? new Date().toISOString()),
      sector: String(row.sector ?? ""),
      organizationType: String(row.organization_type ?? ""),
      dominantProblem: String(row.dominant_problem ?? ""),
      dominantParadox: row.dominant_paradox ? String(row.dominant_paradox) : undefined,
      recommendedStrategy: String(row.recommended_strategy ?? ""),
      keyRisks: Array.isArray(row.key_risks) ? row.key_risks.map((item) => String(item)) : [],
      leveragePoints: Array.isArray(row.leverage_points) ? row.leverage_points.map((item) => String(item)) : [],
      blindSpots: Array.isArray(row.blind_spots) ? row.blind_spots.map((item) => String(item)) : [],
      interventions: Array.isArray(row.interventions) ? row.interventions.map((item) => String(item)) : [],
    };
  }
}
