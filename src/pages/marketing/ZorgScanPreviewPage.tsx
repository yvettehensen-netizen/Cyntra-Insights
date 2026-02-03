// ============================================================
// CYNTRA ZORGSCAN™ — PUBLIC ENTRY (MARKETING TEASER)
// Route: /zorgscan
// Purpose: Trigger → Trust → Portal Unlock
// ============================================================

import { ArrowRight, Lock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function ZorgScanPreviewPage() {
  return (
    <div className="min-h-screen bg-black text-white px-8 py-24">
      <div className="mx-auto max-w-6xl space-y-24">

        {/* ================= HERO ================= */}
        <header className="space-y-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/25">
            Cyntra ZorgScan™ — Boardroom Diagnostic
          </p>

          <h1 className="text-6xl font-bold leading-tight text-[#d4af37]">
            Besluiten verdwijnen niet door gebrek aan advies.
            <br />
            Ze verdwijnen door structuur.
          </h1>

          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            Cyntra toont exact waar governance besluitvorming laat verdampen —
            voordat het cultuur wordt.
          </p>

          {/* CTA */}
          <div className="flex justify-center pt-6">
            <Link
              to="/aurelius/login" // ✅ ADD ONLY (instead of /portal/zorg-scan)
              state={{ from: "/portal/zorg-scan" }} // ✅ ADD ONLY (return target)
              className="
                inline-flex items-center gap-3
                px-10 py-5 rounded-full
                bg-[#d4af37] text-black font-semibold
                hover:bg-[#e5c44c]
                transition
              "
            >
              Start ZorgScan™
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-white/30 pt-3">
            <Lock className="h-4 w-4" />
            Alleen beschikbaar in de besloten omgeving
          </p>

          {/* ======================================================
              ✅ ADD ONLY — TRUST MARKERS (OPTIONAL FUTURE)
          ====================================================== */}
          {/*
          <div className="flex justify-center gap-6 pt-6 text-xs text-white/20 uppercase tracking-widest">
            <span>Governance-grade</span>
            <span>Boardroom-only</span>
            <span>No dashboards</span>
          </div>
          */}
        </header>

        {/* ================= VALUE BLOCK ================= */}
        <section className="grid md:grid-cols-2 gap-10">

          {/* Besluitvormingskaart */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-6 shadow-xl">
            <ShieldAlert className="h-10 w-10 text-[#d4af37]" />

            <h2 className="text-2xl font-semibold text-[#d4af37]">
              Zorg Besluitvormingskaart™
            </h2>

            <p className="text-white/55 leading-relaxed">
              Brengt de exacte fases in kaart waarin besluiten verdwijnen
              tussen MT, bestuur en uitvoering.
            </p>

            <div className="border border-white/10 rounded-2xl p-5 bg-black/40 text-sm text-white/40">
              → Trigger ontstaat  
              → MT herhaalt  
              → Ownership verdampt  
              → Closure ontbreekt  
              → Cyclus herstart
            </div>
          </div>

          {/* Spanningskaart */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-6 shadow-xl">
            <ShieldAlert className="h-10 w-10 text-[#d4af37]" />

            <h2 className="text-2xl font-semibold text-[#d4af37]">
              Zorg Spanningskaart™
            </h2>

            <p className="text-white/55 leading-relaxed">
              Toont de structurele governance-spanningen die beslissingen blokkeren:
              kwaliteit vs kosten, menselijkheid vs protocol.
            </p>

            <div className="border border-white/10 rounded-2xl p-5 bg-black/40 text-sm text-white/40">
              ↔ Autonomie vs Hiërarchie  
              ↔ Protocol vs Realiteit  
              ↔ Strategie vs Incident  
              ↔ Accountability vs Verdamping
            </div>

            {/* ======================================================
                ✅ ADD ONLY — FUTURE CTA DIRECT TO SPANNINGSCAN
            ====================================================== */}
            {/*
            <div className="pt-6">
              <Link
                to="/portal/zorg-spanning"
                className="inline-flex items-center gap-2 text-xs text-[#d4af37] hover:underline"
              >
                Start Spanningskaart →
              </Link>
            </div>
            */}
          </div>
        </section>

        {/* ================= FINAL PUSH ================= */}
        <section className="text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Governance is geen cultuurprobleem.
            <br />
            Het is een besluitstructuurprobleem.
          </h2>

          <p className="text-white/45 max-w-3xl mx-auto leading-relaxed">
            Cyntra geeft geen dashboards.  
            Cyntra geeft geen managementtaal.  
            Cyntra geeft één ding: structurele waarheid.
          </p>

          <Link
            to="/portal"
            className="
              inline-flex items-center gap-3
              px-12 py-6 rounded-full
              border border-[#d4af37]/40
              text-[#d4af37]
              hover:bg-[#d4af37] hover:text-black
              transition
            "
          >
            Unlock Portal Entry
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* ======================================================
              ✅ ADD ONLY — FUTURE PRICING CONVERSION HOOK
          ====================================================== */}
          {/*
          <p className="text-xs text-white/25 pt-4">
            Bekijk toegang via <Link to="/prijzen" className="underline">Prijzen</Link>
          </p>
          */}
        </section>

        {/* FOOTNOTE */}
        <footer className="text-center text-xs text-white/20 pt-10 border-t border-white/10">
          Cyntra ZorgScan™ is diagnostic — geen advies.  
          Alleen structurele boardroom-frictie.
        </footer>
      </div>
    </div>
  );
}

