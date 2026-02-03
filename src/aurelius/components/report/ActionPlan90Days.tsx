// ============================================================
// ✅ CYNTRA ACTIONPLAN90DAYS — FINAL CANON MODULE
// Path: src/aurelius/components/report/ActionPlan90Days.tsx
//
// Fixes:
// ✅ TS2306 "not a module"
// ✅ Proper export default
// ✅ Matches: <ActionPlan90Days plans={...} />
// ============================================================

import React from "react";

/* =========================
   TYPES
========================= */

export interface ActionItem {
  number: number;
  title: string;
  owner: string;
  deadline: string;
}

export interface MonthPlan {
  month: number;
  title: string;
  phase: string;
  actions: ActionItem[];

  // UI tokens
  gradientFrom: string;
  gradientTo: string;
  badgeBg: string;
  numberBg: string;
}

export interface ActionPlan90DaysProps {
  plans: MonthPlan[];
}

/* =========================
   COMPONENT
========================= */

export default function ActionPlan90Days({
  plans,
}: ActionPlan90DaysProps) {
  if (!plans || plans.length === 0) return null;

  return (
    <section className="my-24 space-y-16">
      {/* ================= HEADER ================= */}
      <div className="text-center space-y-5">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4af37]/60">
          Governance Closure Layer
        </p>

        <h2 className="text-5xl font-semibold text-[#d4af37]">
          90-Dagen Actieplan
        </h2>

        <p className="text-white/50 max-w-4xl mx-auto leading-relaxed">
          Concrete interventies met ownership en irreversibility deadlines.
          Geen strategie — closure.
        </p>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
        {plans.map((plan) => (
          <div
            key={plan.month}
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${plan.gradientFrom} ${plan.gradientTo} opacity-80`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 p-10 space-y-8">
              {/* Month Header */}
              <div className="text-center space-y-3">
                <div
                  className={`inline-block px-6 py-3 rounded-2xl ${plan.badgeBg} border border-white/10`}
                >
                  <span className="text-xl font-bold text-[#d4af37]">
                    Maand {plan.month}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold text-white">
                  {plan.phase}
                </h3>

                <p className="text-xs uppercase tracking-widest text-white/30">
                  {plan.title}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-6">
                {plan.actions.map((action) => (
                  <div
                    key={action.number}
                    className="flex gap-5 items-start border border-white/10 bg-black/40 p-5 rounded-2xl"
                  >
                    {/* Number */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${plan.numberBg}`}
                    >
                      <span className="text-black font-bold">
                        {action.number}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">
                        {action.title}
                      </p>

                      <p className="text-xs text-white/40">
                        Owner:{" "}
                        <span className="text-white/70">{action.owner}</span>
                      </p>

                      <p className="text-xs text-white/40">
                        Deadline:{" "}
                        <span className="text-white/70">
                          {action.deadline}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= FOOTER ================= */}
      <p className="text-center text-xs text-white/20 pt-10">
        Cyntra ActionPlan™ = structurele governance interventie, geen cultuuradvies.
      </p>
    </section>
  );
}
