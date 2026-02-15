import { supabase } from "@/lib/supabaseClient";
import type {
  OrganisationPerformanceBaselineRow,
  OrganisationPerformanceSnapshotRow,
  PerformanceBenchmarkSnapshot,
} from "./types";

type RawBaselineRow = {
  organisation_id: string;
  baseline_dsi: number | string;
  baseline_timestamp: string;
  baseline_sri: number | string;
  baseline_execution_score: number | string;
};

type RawSnapshotRow = {
  organisation_id: string;
  measurement_date: string;
  snapshot_timestamp: string;
  dsi: number | string;
  execution_score: number | string;
  decision_velocity: number | string;
};

type RawBenchmarkRow = {
  gemiddelde_dsi_verbetering_pct: number | string;
  top_25_pct_grens: number | string;
  mediaan_verbetering_pct: number | string;
  stagnatie_pct: number | string;
  organisatie_aantal: number | string;
};

function toNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapBaselineRow(row: RawBaselineRow): OrganisationPerformanceBaselineRow {
  return {
    organisation_id: row.organisation_id,
    baseline_dsi: toNumber(row.baseline_dsi),
    baseline_timestamp: row.baseline_timestamp,
    baseline_sri: toNumber(row.baseline_sri),
    baseline_execution_score: toNumber(row.baseline_execution_score),
  };
}

function mapSnapshotRow(row: RawSnapshotRow): OrganisationPerformanceSnapshotRow {
  return {
    organisation_id: row.organisation_id,
    measurement_date: row.measurement_date,
    snapshot_timestamp: row.snapshot_timestamp,
    dsi: toNumber(row.dsi),
    execution_score: toNumber(row.execution_score),
    decision_velocity: toNumber(row.decision_velocity),
  };
}

export async function fetchPerformanceBaseline(
  organisationId: string
): Promise<OrganisationPerformanceBaselineRow | null> {
  const { data, error } = await supabase
    .from("organisation_performance_baseline")
    .select(
      "organisation_id,baseline_dsi,baseline_timestamp,baseline_sri,baseline_execution_score"
    )
    .eq("organisation_id", organisationId)
    .maybeSingle<RawBaselineRow>();

  if (error) throw error;
  if (!data) return null;
  return mapBaselineRow(data);
}

export async function ensurePerformanceBaseline(input: {
  organisation_id: string;
  baseline_dsi: number;
  baseline_sri: number;
  baseline_execution_score: number;
  baseline_timestamp?: string;
}): Promise<OrganisationPerformanceBaselineRow> {
  const existing = await fetchPerformanceBaseline(input.organisation_id);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("organisation_performance_baseline")
    .insert({
      organisation_id: input.organisation_id,
      baseline_dsi: Number(input.baseline_dsi.toFixed(2)),
      baseline_timestamp: input.baseline_timestamp || new Date().toISOString(),
      baseline_sri: Number(input.baseline_sri.toFixed(2)),
      baseline_execution_score: Number(input.baseline_execution_score.toFixed(2)),
    })
    .select(
      "organisation_id,baseline_dsi,baseline_timestamp,baseline_sri,baseline_execution_score"
    )
    .single<RawBaselineRow>();

  if (error || !data) {
    throw error ?? new Error("Performance-baseline opslaan mislukt.");
  }

  return mapBaselineRow(data);
}

export async function upsertPerformanceSnapshot(input: {
  organisation_id: string;
  dsi: number;
  execution_score: number;
  decision_velocity: number;
  snapshot_timestamp?: string;
}): Promise<OrganisationPerformanceSnapshotRow | null> {
  const timestamp = input.snapshot_timestamp || new Date().toISOString();
  const measurementDate = timestamp.slice(0, 10);

  const { data, error } = await supabase
    .from("organisation_performance_snapshots")
    .upsert(
      {
        organisation_id: input.organisation_id,
        measurement_date: measurementDate,
        snapshot_timestamp: timestamp,
        dsi: Number(input.dsi.toFixed(2)),
        execution_score: Number(input.execution_score.toFixed(2)),
        decision_velocity: Number(input.decision_velocity.toFixed(2)),
      },
      { onConflict: "organisation_id,measurement_date" }
    )
    .select(
      "organisation_id,measurement_date,snapshot_timestamp,dsi,execution_score,decision_velocity"
    )
    .maybeSingle<RawSnapshotRow>();

  if (error) throw error;
  if (!data) return null;
  return mapSnapshotRow(data);
}

export async function fetchPerformanceSnapshots(
  organisationId: string,
  days = 120
): Promise<OrganisationPerformanceSnapshotRow[]> {
  const fromDate = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("organisation_performance_snapshots")
    .select(
      "organisation_id,measurement_date,snapshot_timestamp,dsi,execution_score,decision_velocity"
    )
    .eq("organisation_id", organisationId)
    .gte("measurement_date", fromDate)
    .order("measurement_date", { ascending: true })
    .returns<RawSnapshotRow[]>();

  if (error) throw error;
  return (data || []).map(mapSnapshotRow);
}

export async function fetchPerformanceBenchmark(): Promise<PerformanceBenchmarkSnapshot | null> {
  const { data, error } = await supabase
    .from("organisation_performance_benchmark")
    .select(
      "gemiddelde_dsi_verbetering_pct,top_25_pct_grens,mediaan_verbetering_pct,stagnatie_pct,organisatie_aantal"
    )
    .maybeSingle<RawBenchmarkRow>();

  if (error) throw error;
  if (!data) return null;

  return {
    gemiddelde_dsi_verbetering_pct: toNumber(data.gemiddelde_dsi_verbetering_pct),
    top_25_pct_grens: toNumber(data.top_25_pct_grens),
    mediaan_verbetering_pct: toNumber(data.mediaan_verbetering_pct),
    stagnatie_pct: toNumber(data.stagnatie_pct),
    organisatie_aantal: Math.round(toNumber(data.organisatie_aantal)),
  };
}
