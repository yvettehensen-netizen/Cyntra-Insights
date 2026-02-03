import React from "react";
import {
  Crown,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

/* ============================================================
   AURELIUS — HGBCO INTERVENTION EXECUTION LAYER
   BOARDROOM CANON • DECISION-FORCING • NON-NEGOTIABLE
============================================================ */

export type Intervention = {
  priority: number;
  title: string;
  rationale: string;
  why?: string;
  blocker?: string;
  outcome?: string;
  owner: string;
  deliverable: string;
  deadline_days?: number;
};

export default function InterventionPlan({
  interventions,
}: {
  interventions: Intervention[];
}) {
  if (!interventions || interventions.length === 0) return null;

  return (
    <section className="mt-32 space-y-16">
      {/* ================= HEADER ================= */}
      <header className="space-y-6">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/30">
          Aurelius Decision Execution Layer
        </p>

        <h2 className="text-5xl font-semibold text-[#d4af37] leading-tight">
          Bestuurlijk Interventieplan
        </h2>

        <p className="text-white/55 max-w-4xl text-xl leading-relaxed">
          Dit document beschrijft geen verbeterpunten en geen
          aanbevelingen.  
          Dit is een set onomkeerbare interventies die het huidige
          besluitvormingspatroon doorbreken en bestuurlijke closure
          afdwingen.
        </p>
      </header>

      {/* ================= INTERVENTIONS ================= */}
      <div className="space-y-12">
        {interventions
          .sort((a, b) => a.priority - b.priority)
          .map((x) => (
            <div
              key={x.priority}
              className="rounded-[2.75rem] border border-white/10 bg-white/[0.035] p-14 space-y-10 shadow-2xl"
            >
              {/* ---------- META ---------- */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white/40">
                  Interventie {x.priority}
                </span>
                <Crown className="h-5 w-5 text-[#d4af37]" />
              </div>

              {/* ---------- TITLE ---------- */}
              <h3 className="text-3xl font-semibold text-white leading-snug">
                {x.title}
              </h3>

              {/* ---------- RATIONALE ---------- */}
              <p className="text-white/70 text-lg leading-relaxed">
                <span className="text-[#d4af37] font-medium">
                  Bestuurlijke noodzaak:
                </span>{" "}
                {x.rationale ?? x.why ?? "—"}
              </p>

              {/* ---------- BLOCKER ---------- */}
              {x.blocker && (
                <div className="flex gap-4 bg-black/50 border border-red-500/20 rounded-2xl p-6">
                  <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5" />
                  <p className="text-white/75 leading-relaxed">
                    <span className="text-red-300 font-medium">
                      Structurele belemmering:
                    </span>{" "}
                    {x.blocker}
                  </p>
                </div>
              )}

              {/* ---------- OWNER ---------- */}
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Besluit-eigenaar
              </p>
              <p className="text-white/85 text-lg">
                {x.owner}
              </p>

              {/* ---------- DELIVERABLE ---------- */}
              <div className="flex gap-4 bg-black/60 border border-white/10 rounded-2xl p-7">
                <CheckCircle2 className="h-5 w-5 text-[#d4af37] mt-0.5" />
                <p className="text-white/80 leading-relaxed">
                  <span className="text-[#d4af37] font-medium">
                    Closure-deliverable:
                  </span>{" "}
                  {x.deliverable}
                </p>
              </div>

              {/* ---------- OUTCOME ---------- */}
              {x.outcome && (
                <div className="flex gap-4 bg-black/50 border border-green-500/20 rounded-2xl p-6">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <p className="text-white/75 leading-relaxed">
                    <span className="text-green-300 font-medium">
                      Bestuurlijk effect:
                    </span>{" "}
                    {x.outcome}
                  </p>
                </div>
              )}

              {/* ---------- DEADLINE ---------- */}
              {typeof x.deadline_days === "number" && (
                <p className="text-xs text-white/35 uppercase tracking-widest">
                  Onomkeerbaarheid na {x.deadline_days} dagen
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}
