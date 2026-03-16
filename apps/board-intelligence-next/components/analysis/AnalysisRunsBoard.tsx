"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalysisRunRow } from "@/lib/cd-types";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export default function AnalysisRunsBoard() {
  const { organizationId } = useOrganization();

  const [items, setItems] = useState<AnalysisRunRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/analysis-runs?organizationId=${organizationId}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load analysis runs");
      }

      setItems((payload.items as AnalysisRunRow[]) ?? []);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : String(refreshError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Analysis Run Registry</h2>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/60 bg-red-950/30 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      <div className="mt-3 overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2">Run ID</th>
              <th className="px-2 py-2">Cycle ID</th>
              <th className="px-2 py-2">Kind</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Model</th>
              <th className="px-2 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-800 text-slate-200">
                <td className="px-2 py-2 font-mono text-xs">{entry.id}</td>
                <td className="px-2 py-2 font-mono text-xs">{entry.decision_cycle_id}</td>
                <td className="px-2 py-2">{entry.analysis_kind}</td>
                <td className="px-2 py-2">{entry.status}</td>
                <td className="px-2 py-2 text-xs text-slate-300">
                  {entry.model_provider}/{entry.model_name}
                </td>
                <td className="px-2 py-2 text-xs text-slate-400">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {!items.length ? (
              <tr>
                <td colSpan={6} className="px-2 py-5 text-sm text-slate-400">
                  No analysis runs for current tenant.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
