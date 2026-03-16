"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useOrganization } from "@/components/providers/OrganizationProvider";

interface GovernanceRow {
  decision_cycle_id: string;
  cycle_key: string;
  title: string;
  status: string;
  dsi_score: number | null;
  risk_index: number | null;
  execution_index: number | null;
  compliance_index: number | null;
  captured_at: string | null;
}

export default function GovernanceOverview() {
  const { organizationId } = useOrganization();
  const [items, setItems] = useState<GovernanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/governance/overview?organizationId=${organizationId}`,
        { cache: "no-store" }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load governance overview");
      }

      setItems((payload.items as GovernanceRow[]) ?? []);
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
          Governance Control Surface
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

      <div className="mt-3 overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2">Cycle</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">DSI</th>
              <th className="px-2 py-2">Captured</th>
              <th className="px-2 py-2">Open</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.decision_cycle_id} className="border-b border-slate-800 text-slate-200">
                <td className="px-2 py-2">
                  <p className="font-medium">{entry.cycle_key}</p>
                  <p className="text-xs text-slate-400">{entry.title}</p>
                </td>
                <td className="px-2 py-2">{entry.status}</td>
                <td className="px-2 py-2">{entry.dsi_score == null ? "-" : entry.dsi_score.toFixed(2)}</td>
                <td className="px-2 py-2 text-xs text-slate-400">
                  {entry.captured_at ? new Date(entry.captured_at).toLocaleString() : "-"}
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/decision-cycles/${entry.decision_cycle_id}`}
                    className="rounded-lg border border-sky-400/70 px-3 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/15"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}

            {!items.length ? (
              <tr>
                <td colSpan={5} className="px-2 py-5 text-sm text-slate-400">
                  No governance data for selected organization.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
