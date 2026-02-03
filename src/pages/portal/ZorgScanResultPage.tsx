// ============================================================
// CYNTRA ZORGSCAN™ — HGBCO RESULTAAT (FINAL CANON)
// Route: /portal/zorg-scan/result/:id
//
// ✅ Sectie 0 HGBCO Besluitkaart (primary)
// ✅ B-layer Governance Failure Map
// ✅ C-layer Closure Intervention Signal
// ✅ O-layer Outcome framing
// ============================================================

import { useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  Target,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function ZorgScanResultPage() {
  const nav = useNavigate();
  const { state } = useLocation();

  if (!state) return <Navigate to="/portal/zorg-scan" replace />;

  const report = state as any;

  /* ============================================================
     ✅ SAFETY GUARDS
  ============================================================ */

  const besluitkaart = report?.besluitkaart ?? [];
  const hgbco = report?.hgbco ?? null;

  return (
    <div className="min-h-screen bg-black text-white px-10 py-24">
      <div className="mx-auto max-w-6xl space-y-24">
        {/* ======================================================
            BACK
        ====================================================== */}
        <button
          onClick={() => nav("/portal/zorg-scan")}
          className="flex items-center gap-2 text-white/30 hover:text-[#d4af37] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Nieuwe scan
        </button>

        {/* ======================================================
            HEADER
        ====================================================== */}
        <header className="space-y-7">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Cyntra ZorgScan™ — Boardroom HGBCO Output
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            {report.organisation}
          </h1>

          {/* PRIMARY FAILURE */}
          <div className="rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-9">
            <p className="text-xs uppercase tracking-widest text-[#d4af37]/70 mb-4">
              Primary Structural Failure
            </p>

            <p className="text-lg text-white/70 leading-relaxed">
              {report.primary_failure}
            </p>
          </div>
        </header>

        {/* ======================================================
            ✅ SECTION 0 — HGBCO BESLUITKAART (PRIMARY)
        ====================================================== */}
        {hgbco && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-[#d4af37]" />
              <h2 className="text-2xl font-semibold text-[#d4af37]">
                HGBCO Besluitkaart (Boardroom Backbone)
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-8">
              {/* H */}
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30">
                  H — Huidige situatie
                </p>
                <p className="text-white/75 leading-relaxed mt-2">
                  {hgbco.H}
                </p>
              </div>

              {/* G */}
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30">
                  G — Gewenste situatie
                </p>
                <p className="text-white/75 leading-relaxed mt-2">
                  {hgbco.G}
                </p>
              </div>

              {/* B */}
              <div>
                <p className="text-xs uppercase tracking-widest text-red-400/70">
                  B — Belemmeringen
                </p>
                <ul className="mt-3 space-y-2 text-white/70">
                  {(hgbco.B ?? []).slice(0, 6).map((b: string, i: number) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>

              {/* C */}
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-400/70">
                  C — Closure interventies
                </p>
                <ul className="mt-3 space-y-2 text-white/70">
                  {(hgbco.C ?? []).slice(0, 6).map((c: string, i: number) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>

              {/* O */}
              <div>
                <p className="text-xs uppercase tracking-widest text-green-400/70">
                  O — Outcome
                </p>
                <p className="text-white/75 leading-relaxed mt-2">
                  {hgbco.O}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            ✅ B-LAYER — GOVERNANCE FAILURE MAP
        ====================================================== */}
        <section className="space-y-12">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-semibold text-[#d4af37]">
              B — Governance Failure Map (Belemmeringen)
            </h2>
          </div>

          <div className="space-y-9">
            {besluitkaart.map((step: any, i: number) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl hover:border-[#d4af37]/40 transition"
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/20 mb-2">
                      Stap {i + 1}
                    </p>

                    <h3 className="text-2xl font-semibold text-[#d4af37]">
                      {step.fase}
                    </h3>
                  </div>

                  <span className="text-[11px] px-4 py-2 rounded-full border border-white/10 text-white/30 uppercase tracking-widest">
                    {step.arena}
                  </span>
                </div>

                {/* SPANNING */}
                <p className="mt-6 text-white/40 text-sm uppercase tracking-widest">
                  Structurele spanning
                </p>
                <p className="text-white/75 text-lg">
                  {step.structurele_spanning}
                </p>

                {/* FAILURE */}
                <p className="mt-6 text-white/40 text-sm uppercase tracking-widest">
                  Failure mode
                </p>
                <p className="text-white/70 leading-relaxed">
                  {step.failure_mode}
                </p>

                {/* SIGNAL */}
                <p className="mt-6 text-red-400/80 text-sm italic">
                  Signaal: {step.signaal}
                </p>
              </div>
            ))}
          </div>

          {besluitkaart.length === 0 && (
            <p className="text-sm text-white/30 italic pt-6">
              Geen governance failure map beschikbaar in dit resultaat.
            </p>
          )}
        </section>

        {/* ======================================================
            ✅ C-LAYER — NEXT CLOSURE INTERVENTION
        ====================================================== */}
        <section className="rounded-3xl border border-blue-500/20 bg-white/5 p-10 space-y-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-[#d4af37]">
              C — Volgende closure interventie
            </h3>
          </div>

          <p className="text-white/65 leading-relaxed">
            De snelste governance-doorbraak ontstaat wanneer één arena expliciet
            ownership krijgt over irreversibility deadlines.
          </p>
        </section>

        {/* ======================================================
            ✅ O-LAYER — OUTCOME EXPORT
        ====================================================== */}
        <section className="pt-6 flex flex-col gap-5">
          <button
            disabled
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl
                       border border-[#d4af37]/30 text-[#d4af37]/40
                       cursor-not-allowed"
          >
            <FileText className="h-5 w-5" />
            Download HGBCO Boardroom PDF (Volgende stap)
          </button>

          <p className="text-xs text-white/20 max-w-2xl leading-relaxed">
            Cyntra output is geen advies.  
            Dit is een besluitdiagnose: waar closure ontbreekt,
            blijft besluitvorming circulair.  
            Outcome ontstaat pas na ownership en mandaat.
          </p>
        </section>

        {/* FOOTER */}
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/15 pt-10">
          HGBCO is het bestuursinstrument — analyse zonder closure is ruis.
        </p>
      </div>
    </div>
  );
}
