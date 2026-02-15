import type {
  DecisionIntelligenceSignal,
  ExecutiveDecisionCardData,
  PatternLearningSignal,
} from "@/cyntra/intelligence/types";

interface ExecutiveDecisionCardProps {
  card: ExecutiveDecisionCardData;
  decision: DecisionIntelligenceSignal;
  pattern: PatternLearningSignal;
}

function truncateWords(input: string, maxWords: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default function ExecutiveDecisionCard({
  card,
  decision,
  pattern,
}: ExecutiveDecisionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5" aria-label="Bestuurlijke besluitkaart">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Bestuurlijke besluitkaart</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Bestuurlijke kernbeslissing</h2>
        </div>
        <span className="rounded-lg border border-[#D4AF37]/60 bg-[#D4AF37]/20 px-3 py-1 text-sm font-semibold text-[#F3D983]">
          {card.confidence_pct.toFixed(1)}% betrouwbaarheid
        </span>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Dominante these</p>
          <p className="mt-2 text-sm text-white/90">{truncateWords(card.dominant_thesis, 24)}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Centrale spanning</p>
          <p className="mt-2 text-sm text-white/90">{truncateWords(card.central_tension, 24)}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Irreversibele keuze</p>
          <p className="mt-2 text-sm text-white/90">{truncateWords(card.irreversible_choice, 24)}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">30 dagen venster</p>
          <p className="mt-2 text-sm text-white/90">{card.window_30d}</p>
        </article>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Irreversibiliteit</p>
          <p className="mt-2 text-2xl font-semibold text-white">{decision.irreversibility_score.toFixed(1)}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Eigenaarschapshelderheid</p>
          <p className="mt-2 text-2xl font-semibold text-white">{decision.ownership_clarity_score.toFixed(1)}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Patrooncluster</p>
          <p className="mt-2 text-sm text-white/90">{pattern.decision_type_cluster[0]}</p>
          <p className="mt-1 text-xs text-white/65">{decision.evolution_state}</p>
        </article>
      </div>

      <article className="mt-3 rounded-2xl border border-white/10 bg-[#0b1017] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/55">Bestuurlijke duiding</p>
        <p className="mt-2 text-sm leading-relaxed text-white/90">{truncateWords(card.narrative, 120)}</p>
      </article>
    </section>
  );
}
