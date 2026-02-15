import { DecisionAccelerationTimeline } from "@/components/aurelius/performance";
import type { PerformanceSurfaceModel } from "@/cyntra/performance-engine";

interface PerformanceImprovementPanelProps {
  performance: PerformanceSurfaceModel;
}

function statusTone(input: PerformanceSurfaceModel["evolution"]): string {
  if (input.regression_flag) return "text-red-200 border-red-400/50 bg-red-950/30";
  if (input.stagnation_flag) return "text-amber-200 border-amber-400/50 bg-amber-950/30";
  return "text-emerald-200 border-emerald-400/50 bg-emerald-950/30";
}

export default function PerformanceImprovementPanel({
  performance,
}: PerformanceImprovementPanelProps) {
  return (
    <section
      className="rounded-3xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Performanceversnelling"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Performanceversnelling
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Besliskrachtindex (DSI)
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Instrument voor aantoonbare verbetering van strategisch besluitvermogen.
          </p>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-sm font-semibold ${statusTone(performance.evolution)}`}>
          {performance.evolution.regression_flag
            ? "Regressie gedetecteerd"
            : performance.evolution.stagnation_flag
            ? "Stagnatie gedetecteerd"
            : "Versnelling aantoonbaar"}
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-5">
        <Metric title="Huidige DSI" value={performance.dsi.current_dsi.toFixed(2)} />
        <Metric
          title="Trend 30 dagen"
          value={`${performance.dsi.trend_30d >= 0 ? "+" : ""}${performance.dsi.trend_30d.toFixed(2)}`}
        />
        <Metric
          title="Trend 90 dagen"
          value={`${performance.dsi.trend_90d >= 0 ? "+" : ""}${performance.dsi.trend_90d.toFixed(2)}`}
        />
        <Metric
          title="Verbetering t.o.v. baseline"
          value={`${performance.evolution.improvement_pct >= 0 ? "+" : ""}${performance.evolution.improvement_pct.toFixed(1)}%`}
        />
        <Metric
          title="Verbeteringssnelheid (30d)"
          value={`${performance.evolution.improvement_velocity >= 0 ? "+" : ""}${performance.evolution.improvement_velocity.toFixed(1)}%`}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <DecisionAccelerationTimeline trajectory={performance.trajectory} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">90-dagen interventie</p>
          <p className="mt-2 text-sm font-semibold text-white">{performance.focus_area}</p>
          <p className="mt-2 text-sm text-white/80">{performance.key_intervention}</p>
          <p className="mt-2 text-sm text-white/80">{performance.measurable_target}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Commercieel bewijs</p>
          <p className="mt-2 text-sm text-white/85">
            Doelstelling: besliskrachtverbetering met 32% binnen 90 dagen.
          </p>
          <p className="mt-1 text-sm text-white/85">
            Meet wat je doet, bewijs wat je bereikt.
          </p>
          <p className="mt-1 text-sm text-white/85">
            DSI: de besliskrachtindex voor directies.
          </p>
          {performance.benchmark ? (
            <p className="mt-3 text-xs text-white/60">
              Benchmark: mediaan {performance.benchmark.mediaan_verbetering_pct.toFixed(1)}%,
              top-25% {performance.benchmark.top_25_pct_grens.toFixed(1)}%.
            </p>
          ) : null}
        </article>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {performance.milestones.map((milestone) => (
          <article
            key={milestone.day}
            className="rounded-xl border border-white/10 bg-[#0b1017] px-3 py-2"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
              Mijlpaal {milestone.day} dagen
            </p>
            <p className="mt-1 text-sm text-white/90">
              Doel DSI {milestone.target_dsi.toFixed(2)} · status {milestone.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/55">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}
