"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterventionRow } from "@/lib/cd-types";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export default function InterventionsBoard() {
  const { organizationId } = useOrganization();
  const [items, setItems] = useState<InterventionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/interventions?organizationId=${organizationId}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load interventions");
      }

      setItems((payload.items as InterventionRow[]) ?? []);
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
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Intervention Lifecycle
        </h2>
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

      <div className="mt-3 space-y-2">
        {items.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100">
                {entry.intervention_code} • {entry.name}
              </p>
              <p className="rounded-full border border-slate-500 px-3 py-1 text-xs text-slate-200">
                {entry.status}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Owner {entry.owner_name} • Cycle {entry.decision_cycle_id}
            </p>
            <div className="mt-2 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
              <p>Target: {entry.target_date ?? "-"}</p>
              <p>Expected impact: {entry.expected_impact_score ?? "-"}</p>
              <p>Actual impact: {entry.actual_impact_score ?? "-"}</p>
            </div>
          </article>
        ))}

        {!items.length ? <p className="text-sm text-slate-400">No interventions available.</p> : null}
      </div>
    </section>
  );
}
