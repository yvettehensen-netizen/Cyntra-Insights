import type { InterventionRow } from "@/lib/cd-types";

const statusClass: Record<string, string> = {
  proposed: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  active: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  paused: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  completed: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  cancelled: "bg-zinc-500/20 text-zinc-200 border-zinc-400/40",
  failed: "bg-red-500/20 text-red-200 border-red-400/40",
};

export default function InterventionsTimeline({ interventions }: { interventions: InterventionRow[] }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Interventions Timeline</h2>

      {interventions.length ? (
        <ol className="mt-3 space-y-3">
          {interventions.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {entry.intervention_code} • {entry.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Owner: {entry.owner_name}
                    {entry.owner_role ? ` (${entry.owner_role})` : ""}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[entry.status] ?? statusClass.proposed}`}>
                  {entry.status}
                </span>
              </div>

              <div className="mt-2 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
                <p>Created: {new Date(entry.created_at).toLocaleDateString()}</p>
                <p>Target: {entry.target_date ?? "-"}</p>
                <p>Expected impact: {entry.expected_impact_score ?? "-"}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No interventions on this cycle.</p>
      )}
    </section>
  );
}
