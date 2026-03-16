"use client";

import OverviewPanel from "@/components/decision-cycle/OverviewPanel";
import ActiveAnalysisRunStatus from "@/components/decision-cycle/ActiveAnalysisRunStatus";
import DominantDecisionCard from "@/components/decision-cycle/DominantDecisionCard";
import TradeOffBlock from "@/components/decision-cycle/TradeOffBlock";
import InterventionsTimeline from "@/components/decision-cycle/InterventionsTimeline";
import GovernanceMetricsPanel from "@/components/decision-cycle/GovernanceMetricsPanel";
import AuditLogViewer from "@/components/decision-cycle/AuditLogViewer";
import RealtimeDsiDashboard from "@/components/governance/RealtimeDsiDashboard";
import { useDecisionCycle } from "@/components/providers/DecisionCycleProvider";

export default function DecisionCycleView() {
  const {
    data,
    loading,
    error,
    refresh,
    realtimeMode,
    realtimeConnected,
    lastSyncedAt,
  } = useDecisionCycle();

  if (loading && !data) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-300">
        Loading decision cycle graph...
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="space-y-3 rounded-2xl border border-red-500/60 bg-red-950/30 p-5">
        <p className="text-sm text-red-100">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-red-300/60 px-3 py-1 text-xs font-semibold text-red-100"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
        <p>
          Sync mode: <span className="font-semibold text-slate-200">{realtimeMode}</span>
          {realtimeConnected ? " (connected)" : " (fallback polling)"}
        </p>
        <p>
          Last sync: <span className="font-semibold text-slate-200">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "-"}</span>
        </p>
      </section>

      <OverviewPanel data={data} />

      <div className="grid gap-5 lg:grid-cols-2">
        <ActiveAnalysisRunStatus analyses={data.analyses} />
        <DominantDecisionCard decisions={data.decisions} />
      </div>

      <TradeOffBlock data={data} />
      <RealtimeDsiDashboard />
      <InterventionsTimeline interventions={data.interventions} />
      <GovernanceMetricsPanel metrics={data.governanceMetrics} />
      <AuditLogViewer audit={data.audit} />
    </div>
  );
}
