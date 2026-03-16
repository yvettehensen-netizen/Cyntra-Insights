import type { GovernanceMetricObservationRow } from "@/lib/cd-types";

export default function GovernanceMetricsPanel({
  metrics,
}: {
  metrics: GovernanceMetricObservationRow[];
}) {
  const sorted = metrics
    .slice()
    .sort((a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime())
    .slice(0, 12);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Governance Metrics</h2>

      {sorted.length ? (
        <div className="mt-3 overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-2 py-2">Metric</th>
                <th className="px-2 py-2">Value</th>
                <th className="px-2 py-2">Observed At</th>
                <th className="px-2 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800 text-slate-200">
                  <td className="px-2 py-2 font-medium">{entry.metric_code}</td>
                  <td className="px-2 py-2">{entry.observed_value.toFixed(2)}</td>
                  <td className="px-2 py-2 text-xs text-slate-400">
                    {new Date(entry.observed_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-400">{entry.source_system}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No governance metrics ingested.</p>
      )}
    </section>
  );
}
