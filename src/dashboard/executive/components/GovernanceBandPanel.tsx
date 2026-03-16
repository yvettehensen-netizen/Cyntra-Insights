import { motion } from "framer-motion";
import type { GovernanceResponse } from "../api/types";

interface GovernanceBandPanelProps {
  data: GovernanceResponse;
}

function badge(severity: string) {
  const s = severity.toLowerCase();
  if (s === "critical") return "bg-red-700/40 text-red-200 border-red-400/40";
  if (s === "high") return "bg-orange-700/40 text-orange-200 border-orange-400/40";
  if (s === "medium") return "bg-amber-700/40 text-amber-200 border-amber-400/40";
  return "bg-emerald-700/30 text-emerald-200 border-emerald-400/40";
}

export default function GovernanceBandPanel({ data }: GovernanceBandPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Governance escalatie logica"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-white">Governance Escalatielogica</h2>
        <p className="text-xs text-white/55">Authority routing, escalatieladder, freeze flags en override-acties.</p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.14em] text-white/55">
            <tr>
              <th className="px-3 py-2">Band</th>
              <th className="px-3 py-2">SRI-bereik</th>
              <th className="px-3 py-2">Eigenaar</th>
              <th className="px-3 py-2">Escalatiepad</th>
              <th className="px-3 py-2">Actie</th>
            </tr>
          </thead>
          <tbody>
            {data.authority_routing_tabel.map((row) => (
              <tr key={row.band} className="border-t border-white/10 text-white/80">
                <td className="px-3 py-2 font-semibold text-white">{row.band}</td>
                <td className="px-3 py-2">{row.sri_min}-{row.sri_max}</td>
                <td className="px-3 py-2">{row.eigenaar}</td>
                <td className="px-3 py-2">{row.escalatiepad}</td>
                <td className="px-3 py-2 text-white/65">{row.actie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Actieve freeze flags</p>
          {data.actieve_freeze_flags.length === 0 ? (
            <p className="mt-2 text-sm text-white/55">Geen actieve freeze flags.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.actieve_freeze_flags.slice(0, 5).map((flag, index) => (
                <li key={`${flag.actie}-${index}`} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-white/75">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-white">{flag.actie}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badge(flag.severity)}`}>{flag.severity}</span>
                  </div>
                  <p>{flag.reden}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Governance overrides</p>
          {data.governance_override_acties.length === 0 ? (
            <p className="mt-2 text-sm text-white/55">Geen override-acties in de geselecteerde periode.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.governance_override_acties.slice(0, 5).map((actie, index) => (
                <li key={`${actie.actie}-${index}`} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-white/75">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-white">{actie.actie}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badge(actie.severity)}`}>{actie.severity}</span>
                  </div>
                  <p>{actie.beschrijving}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </motion.section>
  );
}
