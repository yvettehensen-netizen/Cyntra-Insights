"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { DecisionCycleRow } from "@/lib/cd-types";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DecisionCycleRegistry() {
  const { organizationId } = useOrganization();
  const { user } = useAuth();

  const [title, setTitle] = useState("Board Resource Allocation Cycle");
  const [scope, setScope] = useState(
    "Strategic capital allocation decision across portfolio divisions with governance constraints."
  );
  const [cycleKey, setCycleKey] = useState("board-capital-allocation-2026-q1");

  const [items, setItems] = useState<DecisionCycleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/decision-cycles?organizationId=${organizationId}&limit=100`,
        { cache: "no-store" }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load decision cycles");
      }

      setItems((payload.items as DecisionCycleRow[]) ?? []);
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

  const onCreate = useCallback(async () => {
    if (!organizationId) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/decision-cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          cycleKey,
          title,
          scope,
          priority: 3,
          createdBy: user?.id ?? "system",
          context: {
            decisionDomain: "portfolio_strategy",
            businessUnit: "Corporate",
            geography: "EU",
            regulatoryRegime: "SOX + ESG",
            riskAppetiteScore: 62,
            materialityLevel: 4,
            baselineRevenueImpact: 1250000,
            baselineCostImpact: 540000,
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create decision cycle");
      }

      const created = payload.cycle as DecisionCycleRow;
      setItems((prev) => [created, ...prev]);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : String(createError);
      setError(message);
    } finally {
      setCreating(false);
    }
  }, [organizationId, cycleKey, title, scope, user?.id]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Create Decision Cycle
        </h2>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-xs text-slate-300">
            Cycle Key
            <input
              value={cycleKey}
              onChange={(event) => setCycleKey(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="text-xs text-slate-300">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
        </div>

        <label className="mt-3 block text-xs text-slate-300">
          Scope
          <textarea
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onCreate}
            disabled={!organizationId || creating}
            className="rounded-xl border border-emerald-400/70 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Cycle"}
          </button>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={!organizationId || loading}
            className="rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-500/60 bg-red-950/30 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Decision Cycles</h2>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="px-2 py-2">Key</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Opened</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800 text-slate-200">
                  <td className="px-2 py-2 font-medium">{entry.cycle_key}</td>
                  <td className="px-2 py-2">{entry.title}</td>
                  <td className="px-2 py-2">{entry.status}</td>
                  <td className="px-2 py-2 text-xs text-slate-400">
                    {new Date(entry.opened_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/decision-cycles/${entry.id}`}
                      className="rounded-lg border border-sky-400/70 px-3 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/15"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}

              {!items.length ? (
                <tr>
                  <td className="px-2 py-5 text-sm text-slate-400" colSpan={5}>
                    No cycles for current tenant.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
