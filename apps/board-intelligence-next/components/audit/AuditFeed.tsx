"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditEntry } from "@/lib/cd-types";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export default function AuditFeed() {
  const { organizationId } = useOrganization();

  const [items, setItems] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/audit?organizationId=${organizationId}&limit=300`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load audit feed");
      }

      setItems((payload.items as AuditEntry[]) ?? []);
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
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Audit Event Stream</h2>
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
          <article key={entry.log.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-100">
                {entry.log.entity_type} • {entry.log.action}
              </p>
              <p className="text-xs text-slate-400">{new Date(entry.log.happened_at).toLocaleString()}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Actor: {entry.log.actor}</p>
            {entry.details.length ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {entry.details.slice(0, 5).map((detail) => (
                  <li key={`${entry.log.id}-${detail.field_name}`}>
                    <span className="font-semibold">{detail.field_name}</span>: {detail.old_value ?? "-"} → {detail.new_value ?? "-"}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        {!items.length ? <p className="text-sm text-slate-400">No audit events available.</p> : null}
      </div>
    </section>
  );
}
