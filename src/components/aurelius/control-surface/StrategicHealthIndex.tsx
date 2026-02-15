import type { SriResponse } from "@/dashboard/executive/api/types";
import type {
  DecisionIntelligenceSignal,
  StrategicHealthOutput,
} from "@/cyntra/intelligence/types";

interface StrategicHealthIndexProps {
  sri: SriResponse;
  health: StrategicHealthOutput;
  decision: DecisionIntelligenceSignal;
}

function deltaWaarde(sri: SriResponse, dagen: number): number {
  const reeks = sri.sri_trend;
  if (reeks.length < 2) return 0;

  const laatste = reeks[reeks.length - 1]?.sri ?? 0;
  const referentieIndex = Math.max(0, reeks.length - (dagen + 1));
  const referentie = reeks[referentieIndex]?.sri ?? reeks[0]?.sri ?? laatste;

  return Number((laatste - referentie).toFixed(2));
}

function deltaKleur(delta: number): string {
  if (delta > 0) return "text-emerald-300 border-emerald-400/50 bg-emerald-950/30";
  if (delta >= -2) return "text-amber-300 border-amber-400/50 bg-amber-950/30";
  return "text-red-300 border-red-400/60 bg-red-950/35";
}

function governanceBandKleur(band: string): string {
  if (band === "Exec Committee") return "text-red-300";
  if (band === "CTO Freeze") return "text-red-300";
  if (band === "SRE") return "text-amber-300";
  return "text-emerald-300";
}

function governanceBandLabel(band: string): string {
  if (band === "Exec Committee") return "Bestuurscommissie";
  if (band === "CTO Freeze") return "CTO-bevriezing";
  if (band === "Autonomous") return "Autonoom";
  return band;
}

export default function StrategicHealthIndex({
  sri,
  health,
  decision,
}: StrategicHealthIndexProps) {
  const delta7d = Number.isFinite(health.trend7d) ? health.trend7d : deltaWaarde(sri, 7);
  const delta30d = Number.isFinite(health.trend30d) ? health.trend30d : deltaWaarde(sri, 30);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5" aria-label="Strategische gezondheidsindex">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Strategische gezondheidsindex</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Aurelius stabiliteits- en risico-index</h2>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${governanceBandKleur(sri.sri_band)}`}>
            {governanceBandLabel(sri.sri_band)}
          </div>
          <div className="text-xs text-white/65">
            Evolutie: <span className="font-semibold text-white/80">{decision.evolution_state}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-6">
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">SRI score</p>
          <p className="mt-2 text-4xl font-semibold text-white">{sri.huidige_sri.toFixed(1)}</p>
        </article>

        <article className={`rounded-2xl border p-4 ${deltaKleur(delta7d)}`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/75">7d delta</p>
          <p className="mt-2 text-3xl font-semibold">{delta7d >= 0 ? `+${delta7d}` : delta7d}</p>
        </article>

        <article className={`rounded-2xl border p-4 ${deltaKleur(delta30d)}`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/75">30d delta</p>
          <p className="mt-2 text-3xl font-semibold">{delta30d >= 0 ? `+${delta30d}` : delta30d}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">Strategische gezondheid</p>
          <p className="mt-2 text-3xl font-semibold text-white">{health.score.toFixed(1)}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">
            Board Adoption & Legitimiteitsindex
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {health.board_adoption_legitimacy_index.toFixed(1)}
          </p>
          <p className="mt-2 text-xs text-white/60">Schaal 0-10 (bestuurlijke adoptie)</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">Besluitsterkte</p>
          <p className="mt-2 text-3xl font-semibold text-white">{decision.decision_strength_index.toFixed(1)}</p>
          <p className="mt-2 text-xs text-white/60">
            Uitvoerbaarheid {decision.execution_probability.toFixed(1)}%
          </p>
        </article>
      </div>
    </section>
  );
}
