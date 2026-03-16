import type { DecisionCycleReconstruction } from "@/lib/cd-types";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TradeOffBlock({ data }: { data: DecisionCycleReconstruction }) {
  const metrics = data.governanceMetrics;

  const gateScore = metrics.find((entry) => entry.metric_code === "gate_score")?.observed_value ?? 0;
  const executionSpeed =
    metrics.find((entry) => entry.metric_code === "decision_velocity")?.observed_value ?? 0;
  const conflictRecurrence =
    metrics.find((entry) => entry.metric_code === "conflict_recurrence")?.observed_value ?? 0;

  const interventionBurden = data.interventions.filter((entry) =>
    ["active", "paused", "proposed"].includes(entry.status)
  ).length;

  const pressureIndex = Math.round(
    toNumber(conflictRecurrence) * 0.4 + interventionBurden * 8 + (100 - toNumber(gateScore)) * 0.2
  );

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Trade-Off Block</h2>
      <p className="mt-2 text-xs text-slate-400">
        Enterprise keuzeconflict telemetry between control quality, execution speed, and conflict pressure.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Metric label="Gate Score" value={toNumber(gateScore).toFixed(2)} />
        <Metric label="Execution Speed" value={toNumber(executionSpeed).toFixed(2)} />
        <Metric label="Conflict Recurrence" value={toNumber(conflictRecurrence).toFixed(2)} />
        <Metric label="Open Intervention Burden" value={String(interventionBurden)} />
        <Metric label="Pressure Index" value={String(pressureIndex)} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
      <p className="text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
