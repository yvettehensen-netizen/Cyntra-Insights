"use client";

import { useCallback, useEffect, useState } from "react";
import { useOrganization } from "@/components/providers/OrganizationProvider";

interface OrganizationRow {
  id: string;
  name: string;
}

export default function OrganizationRegistry() {
  const { organizations, organizationId, setOrganizationId } = useOrganization();
  const [name, setName] = useState("Cyntra Holding NV");
  const [items, setItems] = useState<OrganizationRow[]>(organizations);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(organizations);
  }, [organizations]);

  const createOrganization = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create organization");
      }

      const row = payload.organization as OrganizationRow;
      setItems((prev) => {
        const exists = prev.some((entry) => entry.id === row.id);
        if (exists) return prev;
        return [...prev, row].sort((a, b) => a.name.localeCompare(b.name));
      });
      setOrganizationId(row.id);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : String(createError);
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [name, setOrganizationId]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Tenant Registry
        </h2>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-[320px] flex-1 text-xs text-slate-300">
            Organization Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <button
            type="button"
            onClick={() => void createOrganization()}
            disabled={busy || name.trim().length < 2}
            className="rounded-xl border border-emerald-400/70 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create/Resolve"}
          </button>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-500/60 bg-red-950/30 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Organizations</h2>
        <ul className="mt-3 space-y-2">
          {items.map((entry) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                organizationId === entry.id
                  ? "border-emerald-400/70 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-950/70"
              }`}
            >
              <span className="text-sm text-slate-100">{entry.name}</span>
              <button
                type="button"
                onClick={() => setOrganizationId(entry.id)}
                className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                Scope
              </button>
            </li>
          ))}
          {!items.length ? (
            <li className="text-sm text-slate-400">No organizations registered.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
