import type { DecisionCycleReconstruction } from "@/lib/cd-types";

export default function OverviewPanel({ data }: { data: DecisionCycleReconstruction }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Overview</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric label="Cycle Key" value={data.cycle.cycle_key} />
        <Metric label="Status" value={data.cycle.status} />
        <Metric label="Priority" value={String(data.cycle.priority)} />
        <Metric label="Snapshot Version" value={String(data.cycle.current_snapshot_version)} />
        <Metric label="Opened" value={new Date(data.cycle.opened_at).toLocaleString()} />
        <Metric
          label="Target Decision"
          value={data.cycle.target_decision_at ? new Date(data.cycle.target_decision_at).toLocaleString() : "-"}
        />
        <Metric
          label="Closed"
          value={data.cycle.closed_at ? new Date(data.cycle.closed_at).toLocaleString() : "-"}
        />
        <Metric label="Scope" value={data.cycle.scope} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
      <p className="text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}
