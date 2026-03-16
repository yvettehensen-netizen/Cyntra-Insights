// ============================================================================
// src/pages/portal/GovernanceDashboardPage.tsx
// DEFINITIEF • MATCHT Bestaande Scorecard + TimeSeriesChart types
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireRole from "@/aurelius/rbac/RequireRole";
import { useRBAC } from "@/aurelius/rbac/useRBAC";

import Scorecard from "@/aurelius/components/dashboard/Scorecard";
import TimeSeriesChart from "@/aurelius/components/dashboard/TimeSeriesChart";

export default function GovernanceDashboardPage() {
  const organisationId = useMemo(() => {
    const raw = localStorage.getItem("active_org_id");
    return raw ? raw : null;
  }, []);

  const { role, loading } = useRBAC(organisationId);

  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [days, setDays] = useState(90);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!organisationId) return;
      setBusy(true);
      setErr(null);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setErr("Geen sessie. Log opnieuw in.");
        setBusy(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "aurelius-metrics",
        {
          headers: { Authorization: `Bearer ${token}` },
          body: { organisation_id: organisationId, days },
        }
      );

      if (!alive) return;

      if (error) {
        setErr(error.message);
        setBusy(false);
        return;
      }

      if (!data?.success) {
        setErr(data?.error ?? "Geen metrics ontvangen");
        setBusy(false);
        return;
      }

      setData(data);
      setBusy(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [organisationId, days]);

  return (
    <div className="min-h-screen bg-black text-white px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/30">
            Governance Dashboard — Decision Decay Monitor
          </p>
          <h1 className="text-4xl font-semibold text-[#d4af37]">
            Bestuurlijke grip, in tijd.
          </h1>
          <p className="text-white/50 max-w-3xl">
            Inzicht in besluitkwaliteit: snelheid, eigenaarschap,
            escalatiefictie en irreversibility-risico.
          </p>
        </header>

        <RequireRole role={role} required="viewer" loading={loading}>
          <div className="flex items-center gap-3">
            <label className="text-white/50 text-sm">Periode</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2"
            >
              <option value={30}>30 dagen</option>
              <option value={90}>90 dagen</option>
              <option value={180}>180 dagen</option>
              <option value={365}>365 dagen</option>
            </select>

            {busy && <span className="text-white/40 text-sm">Laden…</span>}
            {err && <span className="text-red-400 text-sm">{err}</span>}
          </div>

          {data?.latest && (
            <Scorecard
              latest={data.latest}
              averages={data.averages}
              role={data.role}
              days={data.days}
            />
          )}

          {Array.isArray(data?.series) && data.series.length > 1 && (
            <TimeSeriesChart series={data.series} />
          )}

          {!busy && !err && (!data?.series || data.series.length === 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Nog geen governance-metrics beschikbaar voor deze organisatie.
            </div>
          )}
        </RequireRole>
      </div>
    </div>
  );
}
