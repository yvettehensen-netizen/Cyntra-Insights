import { motion } from "framer-motion";
import { Activity, AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";
import type { SriResponse } from "../api/types";

interface ExecutiveStatusBarProps {
  sri: SriResponse;
  onRunExecutiveIntelligence: () => void;
  laden?: boolean;
}

function kleurKlasse(kleur: string) {
  if (kleur === "deep-red") return "text-red-200 bg-red-900/40 border-red-400/40";
  if (kleur === "red") return "text-red-200 bg-red-800/30 border-red-300/40";
  if (kleur === "orange") return "text-amber-200 bg-amber-700/30 border-amber-300/40";
  return "text-emerald-200 bg-emerald-800/25 border-emerald-300/40";
}

function waardeKleur(kleur: string) {
  if (kleur === "deep-red") return "text-red-300";
  if (kleur === "red") return "text-red-300";
  if (kleur === "orange") return "text-amber-300";
  return "text-emerald-300";
}

export default function ExecutiveStatusBar({
  sri,
  onRunExecutiveIntelligence,
  laden = false,
}: ExecutiveStatusBarProps) {
  const items = [
    {
      label: "Huidige SRI",
      value: sri.huidige_sri.toFixed(1),
      icon: Activity,
    },
    {
      label: "SRI-band",
      value: sri.sri_band,
      icon: ShieldAlert,
    },
    {
      label: "Drift delta (7d)",
      value: sri.drift_delta_7d.toFixed(2),
      icon: TrendingUp,
    },
    {
      label: "Risicosnelheid",
      value: sri.risicosnelheid.toFixed(2),
      icon: AlertTriangle,
    },
    {
      label: "Governance status",
      value: sri.governance_state,
      icon: ShieldAlert,
    },
    {
      label: "Actieve escalaties",
      value: String(sri.actieve_escalaties),
      icon: AlertTriangle,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-4"
      aria-label="Executive status balk"
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Executive Controlekamer</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Besluitintelligentie in realtime</h1>
        </div>

        <button
          type="button"
          onClick={onRunExecutiveIntelligence}
          disabled={laden}
          className="inline-flex items-center justify-center rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/20 px-4 py-2 text-sm font-semibold text-[#f3d983] transition hover:bg-[#d4af37]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {laden ? "Bezig met verversen..." : "Start Executive Intelligence"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className={`rounded-xl border p-3 ${kleurKlasse(sri.governance_kleur)}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">{item.label}</p>
                <Icon className="h-4 w-4 text-white/70" aria-hidden="true" />
              </div>
              <p className={`text-lg font-semibold ${waardeKleur(sri.governance_kleur)}`}>{item.value}</p>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
