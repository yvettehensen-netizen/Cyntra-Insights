import type { AnalysisRunDetail } from "@/lib/cd-types";

const statusColor: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  running: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  done: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  failed: "bg-red-500/20 text-red-200 border-red-400/40",
  cancelled: "bg-zinc-500/20 text-zinc-200 border-zinc-400/40",
};

export default function ActiveAnalysisRunStatus({ analyses }: { analyses: AnalysisRunDetail[] }) {
  const active = analyses[0]?.run;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Active Analysis Run</h2>
      {active ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-100">{active.analysis_kind}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor[active.status] ?? statusColor.pending}`}>
              {active.status}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Metric label="Model" value={`${active.model_provider} / ${active.model_name}`} />
            <Metric label="Prompt Version" value={active.prompt_version} />
            <Metric label="Started" value={active.started_at ? new Date(active.started_at).toLocaleString() : "-"} />
            <Metric label="Finished" value={active.finished_at ? new Date(active.finished_at).toLocaleString() : "-"} />
          </div>

          {active.error_message ? (
            <div className="rounded-lg border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-100">
              {active.error_message}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No analysis runs yet.</p>
      )}
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
