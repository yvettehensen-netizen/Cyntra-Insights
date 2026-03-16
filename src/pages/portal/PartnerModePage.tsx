// ============================================================================
// src/pages/portal/PartnerModePage.tsx
// DEFINITIEF • FOUTLOOS • GEEN @-ALIASES • MATCHT JOUW MAPSTRUCTUUR
// ============================================================================

import { useEffect, useState } from "react";

// 🔴 BELANGRIJK: relatieve paden vanaf src/pages/portal
import { supabase } from "../../lib/supabaseClient";
import RequireRole from "../../aurelius/rbac/RequireRole";
import { useRBAC } from "../../aurelius/rbac/useRBAC";

export default function PartnerModePage() {
  const organisationId = localStorage.getItem("active_org_id");
  const { role, loading } = useRBAC(organisationId);

  const [partner, setPartner] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!organisationId) return;

      setBusy(true);
      setErr(null);

      const { data: org, error: orgErr } = await supabase
        .from("organisations")
        .select("id,name,partner_id,partners(id,name,slug)")
        .eq("id", organisationId)
        .maybeSingle();

      if (!alive) return;

      if (orgErr) {
        setErr(orgErr.message);
        setBusy(false);
        return;
      }

      setPartner(org?.partners ?? null);

      if (org?.partner_id) {
        const { data: s, error: sErr } = await supabase
          .from("partner_settings")
          .select("*")
          .eq("partner_id", org.partner_id)
          .maybeSingle();

        if (!alive) return;

        if (sErr) {
          setErr(sErr.message);
          setBusy(false);
          return;
        }

        setSettings(s ?? null);
      }

      setBusy(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [organisationId]);

  return (
    <div className="min-h-screen bg-black text-white px-8 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/30">
            Partner / Agency Mode
          </p>
          <h1 className="text-4xl font-semibold text-[#d4af37]">
            White-label & resale
          </h1>
          <p className="text-white/50 max-w-3xl">
            Koppel organisaties aan partners, beheer branding en lever
            rapporten onder partnerlabel.
          </p>
        </header>

        <RequireRole role={role} required="bestuur" loading={loading}>
          {busy && <div className="text-white/40">Laden…</div>}
          {err && <div className="text-red-400">{err}</div>}

          {!partner ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
              Geen partner gekoppeld aan deze organisatie.
              <div className="mt-4 text-white/40 text-sm">
                Koppel via Supabase (organisations.partner_id).
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
              <div>
                <p className="text-white/40 text-sm">Partner</p>
                <p className="text-2xl font-semibold">{partner.name}</p>
                <p className="text-white/40 text-sm mt-1">
                  Slug: {partner.slug}
                </p>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <p className="text-white/40 text-sm">Brand settings</p>
                <p className="text-white/70">
                  Brand name:{" "}
                  <span className="text-[#d4af37]">
                    {settings?.brand_name ?? "—"}
                  </span>
                </p>
                <p className="text-white/70">
                  Primary:{" "}
                  <span className="text-white/60">
                    {settings?.primary_color ?? "—"}
                  </span>
                </p>
                <p className="text-white/70">
                  Accent:{" "}
                  <span className="text-white/60">
                    {settings?.accent_color ?? "—"}
                  </span>
                </p>
                <p className="text-white/70">
                  Logo:{" "}
                  <span className="text-white/60">
                    {settings?.logo_url ?? "—"}
                  </span>
                </p>
              </div>

              <div className="text-white/35 text-xs">
                Volgende stap: partner branding doortrekken naar PDF-renderer.
              </div>
            </div>
          )}
        </RequireRole>
      </div>
    </div>
  );
}
