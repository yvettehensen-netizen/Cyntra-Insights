import { motion } from "framer-motion";
import type { BoardSummaryResponse } from "../api/types";

interface BoardSummaryCardProps {
  data: BoardSummaryResponse;
}

function kleurVoorReadiness(score: number) {
  if (score < 40) return "text-red-300";
  if (score < 65) return "text-amber-300";
  return "text-emerald-300";
}

export default function BoardSummaryCard({ data }: BoardSummaryCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-6"
      aria-label="Board view samenvatting"
    >
      <header className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.34em] text-white/45">Board Weergave</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Bestuurlijke samenvatting</h2>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Bestuurlijke thesis</p>
          <p className="mt-2 text-sm text-white/85 break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            {data.executive_thesis}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Dominant risico</p>
          <p className="mt-2 text-sm text-white/85 break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            {data.dominant_risico}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Onomkeerbare beslissing</p>
          <p className="mt-2 text-sm text-white/85 break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            {data.onomkeerbaar_besluit}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">90-dagen authority samenvatting</p>
          <p className="mt-2 text-sm text-white/85 break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            {data.authority_summary_90_dagen}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Escalatie exposure</p>
          <p className="mt-2 text-sm text-white/85 break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            Actief: {data.escalatie_exposure.actief} · Hoogste ernst: {data.escalatie_exposure.hoogste_ernst}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">Governance readiness score</p>
          <p className={`mt-1 text-3xl font-semibold ${kleurVoorReadiness(data.governance_readiness_score)}`}>
            {data.governance_readiness_score.toFixed(1)}
          </p>
        </article>
      </div>
    </motion.section>
  );
}
