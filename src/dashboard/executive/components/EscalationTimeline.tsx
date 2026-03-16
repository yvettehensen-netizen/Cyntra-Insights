import { motion } from "framer-motion";
import type { GovernanceResponse } from "../api/types";

interface EscalationTimelineProps {
  data: GovernanceResponse;
}

function kleurDot(severity: string) {
  const s = severity.toLowerCase();
  if (s === "critical") return "bg-red-500";
  if (s === "high") return "bg-orange-500";
  if (s === "medium") return "bg-amber-400";
  return "bg-emerald-400";
}

export default function EscalationTimeline({ data }: EscalationTimelineProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Escalatie tijdlijn"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-white">Escalatietijdlijn</h2>
        <p className="text-xs text-white/55">Ladder van actieve governance-escalaties met status.</p>
      </header>

      {data.escalation_ladder.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm text-white/55">
          Geen actieve escalaties in de timeline.
        </div>
      ) : (
        <ol className="relative ml-2 border-l border-white/10 pl-5">
          {data.escalation_ladder.slice(0, 10).map((event, index) => (
            <li key={`${event.tijdstip}-${index}`} className="mb-4">
              <span className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border border-white/50 ${kleurDot(event.severity)}`} />
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                {new Date(event.tijdstip).toLocaleString("nl-NL")}
              </p>
              <p className="text-sm font-semibold text-white">{event.actie}</p>
              <p className="text-xs text-white/65">{event.reden}</p>
              <p className="mt-1 text-[11px] text-white/45">Status: {event.status}</p>
            </li>
          ))}
        </ol>
      )}
    </motion.section>
  );
}
