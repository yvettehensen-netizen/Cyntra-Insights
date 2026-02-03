"use client";

// ============================================================
// PORTAL — ZORGSCAN HGBCO BOARDROOM ANALYSE (FINAL CANON)
//
// ✅ HGBCO Besluitkaart-first UI
// ✅ Governance + Onderstroom blokkades
// ✅ Closure interventies (C-layer)
// ✅ Outcome focus (veiligheid + continuïteit)
// ============================================================

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldAlert,
  Activity,
  Target,
  TrendingUp,
} from "lucide-react";

export default function ZorgScanPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-10 py-14">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* ======================================================
            HEADER — HGBCO POSITIONING
        ====================================================== */}
        <header className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/30">
            Cyntra ZorgScan™ — HGBCO Decision Governance Layer
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-[#d4af37]">
            ZorgScan — Boardroom Besluitkaart
          </h1>

          <p className="text-neutral-400 text-lg max-w-4xl leading-relaxed">
            Dit is geen rapportmodule. Dit is een bestuurlijk stuurinstrument.
            <br />
            Elke ZorgScan is gebouwd volgens HGBCO:
            <span className="text-white/70 font-medium">
              {" "}
              Huidige situatie → Gewenste situatie → Belemmeringen → Concreet
              plan → Outcome.
            </span>
          </p>
        </header>

        {/* ======================================================
            HGBCO DECISION CARD (PRIMARY UI)
        ====================================================== */}
        <Card className="rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-[#d4af37]" />
              <h2 className="text-2xl font-semibold">
                HGBCO Besluitkaart (Bestuurlijk Backbone)
              </h2>
            </div>

            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              De ZorgScan start altijd met een compacte besluitkaart:
              <br />
              één pagina die aangeeft waar de organisatie nu staat, wat het
              bestuur wil bereiken, wat blokkeert, welke interventies closure
              afdwingen en welke outcome wordt unlocked.
            </p>

            <Button className="rounded-xl px-8 py-6 text-lg font-semibold bg-[#d4af37] text-black hover:opacity-90">
              Open HGBCO Besluitkaart
            </Button>
          </CardContent>
        </Card>

        {/* ======================================================
            MODULES — BLOCKERS & CLOSURE LAYERS
        ====================================================== */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* B — Belemmeringen */}
          <Card className="rounded-3xl bg-neutral-900 border border-white/10 shadow-xl">
            <CardContent className="p-9 space-y-5">
              <ShieldAlert className="w-10 h-10 text-red-400" />

              <h2 className="text-2xl font-semibold">
                B — Belemmeringen & Frictie
              </h2>

              <p className="text-neutral-400 leading-relaxed">
                Identificeert waar besluitvorming verdampt:
                governance-blokkades, escalatievertraging, onderstroom en
                structurele spanningen tussen werkvloer en bestuur.
              </p>

              <Button className="w-full rounded-xl">
                Open Belemmeringenkaart
              </Button>
            </CardContent>
          </Card>

          {/* C — Concrete Closure */}
          <Card className="rounded-3xl bg-neutral-900 border border-white/10 shadow-xl">
            <CardContent className="p-9 space-y-5">
              <Activity className="w-10 h-10 text-blue-400" />

              <h2 className="text-2xl font-semibold">
                C — Closure Interventies
              </h2>

              <p className="text-neutral-400 leading-relaxed">
                Concreet plan om besluitvorming te forceren:
                eigenaarschap, mandaat, closure deadlines en interventies die
                blokkades direct verwijderen.
              </p>

              <Button className="w-full rounded-xl">
                Open Interventieplan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================
            O — OUTCOME EXPORT
        ====================================================== */}
        <Card className="rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <CardContent className="p-11 space-y-7">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-semibold">
                O — Outcome Boardroom Report (PDF)
              </h3>
            </div>

            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              Exporteer een premium bestuursrapport met:
              <br />
              HGBCO besluitkaart, governance-frictie, closure interventies en
              meetbare outcome richting kwaliteit, continuïteit en financiële
              stabiliteit.
            </p>

            <Button className="rounded-xl px-10 py-6 text-lg font-semibold bg-[#d4af37] text-black hover:opacity-90">
              Download HGBCO ZorgScan Rapport
            </Button>
          </CardContent>
        </Card>

        {/* ======================================================
            FOOTER SIGNAL
        ====================================================== */}
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/20 pt-8">
          Cyntra ZorgScan™ is een besluitinstrument — geen analyse zonder closure.
        </p>
      </div>
    </div>
  );
}
