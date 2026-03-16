import type { DecisionRecordRow } from "@/lib/cd-types";

const outcomeClasses: Record<string, string> = {
  approved: "text-emerald-200 border-emerald-400/40 bg-emerald-500/15",
  rejected: "text-red-200 border-red-400/40 bg-red-500/15",
  deferred: "text-amber-200 border-amber-400/40 bg-amber-500/15",
  conditional: "text-cyan-200 border-cyan-400/40 bg-cyan-500/15",
};

export default function DominantDecisionCard({ decisions }: { decisions: DecisionRecordRow[] }) {
  const dominant = decisions[0];

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Dominant Decision</h2>
      {dominant ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-100">{dominant.decision_code}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${outcomeClasses[dominant.outcome] ?? outcomeClasses.conditional}`}>
              {dominant.outcome}
            </span>
          </div>

          <p className="text-sm text-slate-200">{dominant.decision_statement}</p>
          <p className="text-xs text-slate-400">Approved by {dominant.approved_by} • {new Date(dominant.approved_at).toLocaleString()}</p>

          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-300">
            {dominant.rationale}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No committed decision yet.</p>
      )}
    </section>
  );
}
