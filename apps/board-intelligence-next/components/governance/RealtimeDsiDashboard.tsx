"use client";

import { useDsi } from "@/components/providers/DsiProvider";
import { useDecisionCycle } from "@/components/providers/DecisionCycleProvider";
import DsiTrendChart from "@/components/governance/DsiTrendChart";

export default function RealtimeDsiDashboard() {
  const { score, factors, trend, loading, error, refreshTrend } = useDsi();
  const { realtimeMode, realtimeConnected, realtimeLastEventAt } = useDecisionCycle();

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Live DSI Monitoring</h2>
          <p className="mt-1 text-xs text-slate-400">
            DSI is derived from decision infrastructure telemetry in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              realtimeConnected
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                : "border-amber-400/50 bg-amber-500/15 text-amber-200"
            }`}
          >
            {realtimeMode.toUpperCase()}
          </span>

          <button
            type="button"
            onClick={() => void refreshTrend()}
            className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            Refresh Trend
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Metric label="DSI Score" value={score.toFixed(2)} />
        <Metric label="Conflict Count" value={String(factors.conflict_count)} />
        <Metric label="Execution Speed" value={factors.execution_speed.toFixed(2)} />
        <Metric
          label="Intervention Completion"
          value={`${factors.intervention_completion_rate.toFixed(2)}%`}
        />
        <Metric label="Decision Latency (h)" value={factors.decision_latency.toFixed(2)} />
        <Metric label="Governance Discipline" value={factors.governance_discipline.toFixed(2)} />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      <DsiTrendChart points={trend} />

      <p className="text-xs text-slate-500">
        Last event: {realtimeLastEventAt ? new Date(realtimeLastEventAt).toLocaleString() : "no event"}
        {loading ? " • refreshing trend…" : ""}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
      <p className="text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
