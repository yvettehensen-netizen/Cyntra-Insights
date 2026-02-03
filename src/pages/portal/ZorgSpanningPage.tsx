// ============================================================
// CYNTRA ZORGSPANNING™ — HGBCO INTAKE PAGE (FINAL CANON)
// Route: /portal/zorg-spanning
//
// ✅ HGBCO-driven intake (H,G,B,C,O)
// ✅ Boardroom governance diagnostic input
// ✅ Outcome + closure framing
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, Target } from "lucide-react";

export default function ZorgSpanningPage() {
  const nav = useNavigate();

  /* ============================================================
     HGBCO INPUT STATE
  ============================================================ */

  const [organisation, setOrganisation] = useState("");

  const [currentState, setCurrentState] = useState("");
  const [desiredState, setDesiredState] = useState("");
  const [blockers, setBlockers] = useState("");
  const [outcome, setOutcome] = useState("");

  const ready =
    organisation.trim().length > 2 && currentState.trim().length > 8;

  /* ============================================================
     RUN SCAN
  ============================================================ */

  async function runScan() {
    if (!ready) return;

    const payload = {
      organisation,
      hgbco: {
        current_state: currentState,
        desired_state: desiredState,
        blockers,
        outcome_metric: outcome,
      },
    };

    const res = await fetch("/api/zorg-spanning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    nav(`/portal/zorg-spanning/result/${json.id}`, {
      state: json.report,
    });
  }

  return (
    <div className="min-h-screen bg-black text-white px-10 py-20">
      <div className="mx-auto max-w-4xl space-y-20">
        {/* ======================================================
            HERO
        ====================================================== */}
        <header className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Cyntra ZorgSpanning™ — HGBCO Diagnostic Intake
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            Waar spanning structureel blijft hangen
            <br />
            tussen bestuur en uitvoering.
          </h1>

          <p className="text-white/45 max-w-2xl leading-relaxed text-lg">
            Dit is geen adviesformulier.  
            Dit is een bestuurlijke HGBCO intake:  
            realiteit → blokkade → closure → outcome.
          </p>
        </header>

        {/* ======================================================
            HGBCO INTAKE FORM
        ====================================================== */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-10 shadow-xl">
          {/* ORGANISATION */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Organisatie
            </p>

            <input
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              placeholder="Ziekenhuis / Zorginstelling"
              className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white
                         focus:outline-none focus:border-[#d4af37]/60 transition"
            />
          </div>

          {/* H — CURRENT */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-red-400/70">
              H — Huidige situatie (waar zit de spanning?)
            </p>

            <textarea
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              placeholder="Beschrijf kort wat er structureel vastloopt..."
              className="w-full min-h-[90px] rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white
                         focus:outline-none focus:border-red-400/50 transition"
            />
          </div>

          {/* G — DESIRED */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-blue-400/70">
              G — Gewenste situatie (wat moet governance opleveren?)
            </p>

            <textarea
              value={desiredState}
              onChange={(e) => setDesiredState(e.target.value)}
              placeholder="Wat zou een gezonde bestuurlijke toestand zijn?"
              className="w-full min-h-[80px] rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white
                         focus:outline-none focus:border-blue-400/50 transition"
            />
          </div>

          {/* B — BLOCKERS */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-yellow-400/70">
              B — Belemmeringen (waar verdampt besluitvorming?)
            </p>

            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Welke blokkades voel je: mandaat, escalatie, onderstroom?"
              className="w-full min-h-[80px] rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white
                         focus:outline-none focus:border-yellow-400/50 transition"
            />
          </div>

          {/* O — OUTCOME */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-green-400/70">
              O — Outcome (wat moet dit unlocken?)
            </p>

            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Welke meetbare outcome is cruciaal: veiligheid, continuïteit, stabiliteit?"
              className="w-full min-h-[70px] rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white
                         focus:outline-none focus:border-green-400/50 transition"
            />
          </div>

          {/* SUBMIT */}
          <button
            disabled={!ready}
            onClick={runScan}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-5
                       border border-[#d4af37]/50 text-[#d4af37]
                       hover:bg-[#d4af37] hover:text-black transition
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Target className="h-5 w-5" />
            Genereer HGBCO Spanningskaart
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-white/20 max-w-xl leading-relaxed">
          Cyntra ZorgSpanning™ is een boardroom-diagnose.  
          Geen analyse zonder closure.  
          HGBCO is het bestuurlijke stuurinstrument.
        </p>
      </div>
    </div>
  );
}
