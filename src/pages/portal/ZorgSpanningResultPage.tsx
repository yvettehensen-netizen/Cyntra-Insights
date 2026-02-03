// ============================================================
// CYNTRA ZORGSCAN™ — BESLUITVORMINGSKAART RESULTAAT (V2)
// Route: /portal/zorg-scan/result/:id
// Output: Boardroom-grade Decision Failure Map
// ============================================================

import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";

export default function ZorgScanResultPage() {
  const nav = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return <Navigate to="/portal/zorg-scan" replace />;
  }

  const report = state as any;

  /* ============================================================
     ✅ ADD ONLY — SAFETY GUARD (OPTIONAL)
     Prevent runtime crash if besluitkaart is missing
  ============================================================ */
  const besluitkaart = report?.besluitkaart ?? [];

  return (
    <div className="min-h-screen bg-black text-white px-10 py-24">
      <div className="mx-auto max-w-6xl space-y-20">

        {/* BACK */}
        <button
          onClick={() => nav("/portal/zorg-scan")}
          className="flex items-center gap-2 text-white/30 hover:text-[#d4af37] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Nieuwe scan
        </button>

        {/* ================= HEADER ================= */}
        <header className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Cyntra Boardroom Output — Besluitvormingskaart™
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            {report.organisation}
          </h1>

          <div className="rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-8">
            <p className="text-xs uppercase tracking-widest text-[#d4af37]/70 mb-4">
              Primary Structural Failure
            </p>

            <p className="text-lg text-white/70 leading-relaxed">
              {report.primary_failure}
            </p>
          </div>
        </header>

        {/* ======================================================
            ✅ ADD ONLY — NEXT INTERVENTION SIGNAL (OPTIONAL)
        ====================================================== */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 max-w-4xl space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/20">
            Volgende governance-interventie
          </p>
          <p className="text-white/60 leading-relaxed">
            De snelste closure ontstaat wanneer één arena ownership krijgt
            over irreversibility deadlines.
          </p>

          {/* COMMENT: Future AI interventions */}
          {/*
          <p className="text-[#d4af37]/60 text-sm">
            Aurelius kan automatisch interventies voorstellen per fase.
          </p>
          */}
        </section>

        {/* ================= MAP ================= */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-[#d4af37]" />
            <h2 className="text-xl font-semibold tracking-wide text-[#d4af37]">
              Governance Failure Map
            </h2>
          </div>

          <div className="space-y-8">
            {besluitkaart.map((step: any, i: number) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl hover:border-[#d4af37]/40 transition"
              >
                {/* TOPLINE */}
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
                <p className="mt-6 text-white/50 text-sm uppercase tracking-widest">
                  Structurele spanning
                </p>
                <p className="text-white/70 text-lg">
                  {step.structurele_spanning}
                </p>

                {/* FAILURE */}
                <p className="mt-6 text-white/50 text-sm uppercase tracking-widest">
                  Failure Mode
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

          {/* ======================================================
              ✅ ADD ONLY — EMPTY STATE MESSAGE
          ====================================================== */}
          {besluitkaart.length === 0 && (
            <p className="text-sm text-white/30 italic pt-6">
              Geen besluitkaart beschikbaar in dit resultaat.
            </p>
          )}
        </section>

        {/* ================= PDF EXPORT ================= */}
        <div className="pt-6 flex flex-col gap-4">
          <button
            disabled
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl
                       border border-[#d4af37]/30 text-[#d4af37]/40
                       cursor-not-allowed"
          >
            <FileText className="h-5 w-5" />
            Boardroom PDF Export (Volgende stap)
          </button>

          {/* ======================================================
              ✅ ADD ONLY — FUTURE PDF EXPORT HOOK
          ====================================================== */}
          {/*
          <button
            onClick={() => generateBoardroomPDF(report)}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl
                       bg-[#d4af37] text-black font-semibold"
          >
            Download Boardroom PDF
          </button>
          */}

          <p className="text-xs text-white/20 max-w-2xl leading-relaxed">
            Cyntra output is geen advies.  
            Dit is een governance-diagnose: waar closure ontbreekt,
            blijft besluitvorming circulair.
          </p>
        </div>

        {/* ======================================================
            ✅ ADD ONLY — OPTIONAL UNLOCK CTA PLACEHOLDER
        ====================================================== */}
        {/*
        <section className="rounded-3xl border border-[#d4af37]/40 bg-black/80 p-10 text-center space-y-4">
          <h3 className="text-xl font-semibold text-[#d4af37]">
            Full Aurelius Governance Roadmap Locked
          </h3>
          <p className="text-white/50">
            Ontgrendel ownership-model + irreversibility deadlines + interventieplan.
          </p>
          <button
            onClick={() => nav("/prijzen?product=zorgscan")}
            className="px-10 py-4 rounded-2xl bg-[#d4af37] text-black font-semibold"
          >
            Bekijk toegang
          </button>
        </section>
        */}
      </div>
    </div>
  );
}
