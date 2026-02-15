import { useMemo } from "react";
import type {
  DriftAnalysisOutput,
  PatternLearningSignal,
} from "@/cyntra/intelligence/types";

interface DriftMatrixProps {
  drift: DriftAnalysisOutput;
  pattern: PatternLearningSignal;
}

function severity(avgIntensity: number): "critical" | "high" | "medium" | "low" {
  if (avgIntensity > 0.7) return "critical";
  if (avgIntensity > 0.55) return "high";
  if (avgIntensity > 0.35) return "medium";
  return "low";
}

export default function DriftMatrix({ drift, pattern }: DriftMatrixProps) {
  const view = 320;
  const pad = 32;
  const size = view - pad * 2;

  const execDiscipline = 1 - drift.execution_drift;
  const governanceStructure = 1 - drift.structural_drift;

  const dotX = pad + execDiscipline * size;
  const dotY = pad + (1 - governanceStructure) * size;

  const avgDrift = (drift.execution_drift + drift.structural_drift) / 2;
  const derivedSeverity = useMemo(() => severity(avgDrift), [avgDrift]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5" aria-label="Drift Matrix">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Drift Matrix</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Execution vs Governance Drift</h2>
        </div>
        <div className="text-sm text-white">
          Quadrant: <span className="font-semibold text-amber-300">{drift.quadrant}</span> · Severity:{" "}
          <span className={derivedSeverity === "critical" ? "text-red-300" : "text-white/85"}>{derivedSeverity}</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[360px_1fr]">
        <svg
          viewBox={`0 0 ${view} ${view}`}
          className="h-[320px] w-[320px] rounded-2xl border border-white/10 bg-[#0b1017]"
          role="img"
          aria-label="Drift matrix met quadrant en positiedot"
        >
          <rect x={pad} y={pad} width={size} height={size} fill="none" stroke="rgba(255,255,255,0.22)" />
          <line
            x1={pad + size / 2}
            y1={pad}
            x2={pad + size / 2}
            y2={pad + size}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="4 4"
          />
          <line
            x1={pad}
            y1={pad + size / 2}
            x2={pad + size}
            y2={pad + size / 2}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="4 4"
          />

          <text x={pad + 10} y={pad + 18} fill="rgba(255,255,255,0.75)" fontSize="11">
            Stagnating
          </text>
          <text x={pad + size / 2 + 10} y={pad + 18} fill="rgba(255,255,255,0.75)" fontSize="11">
            Chaotic
          </text>
          <text x={pad + 10} y={pad + size / 2 + 18} fill="rgba(255,255,255,0.75)" fontSize="11">
            Stable
          </text>
          <text
            x={pad + size / 2 + 10}
            y={pad + size / 2 + 18}
            fill="rgba(255,255,255,0.75)"
            fontSize="11"
          >
            Fragile
          </text>

          <circle cx={dotX} cy={dotY} r="6.5" fill="#D4AF37" stroke="white" strokeWidth="1.5">
            <title>
              Execution drift {drift.execution_drift.toFixed(2)} / Structural drift {drift.structural_drift.toFixed(2)}
            </title>
          </circle>

          <text x={pad + size / 2 - 52} y={view - 10} fill="rgba(255,255,255,0.7)" fontSize="11">
            Execution discipline →
          </text>
          <text
            x={12}
            y={pad + size / 2}
            fill="rgba(255,255,255,0.7)"
            fontSize="11"
            transform={`rotate(-90 12 ${pad + size / 2})`}
          >
            Structural governance →
          </text>
        </svg>

        <div className="grid gap-3">
          <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Structural drift</p>
            <p className="mt-2 text-3xl font-semibold text-white">{(drift.structural_drift * 100).toFixed(1)}%</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Execution drift</p>
            <p className="mt-2 text-3xl font-semibold text-white">{(drift.execution_drift * 100).toFixed(1)}%</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4 text-sm text-white/75">
            X-as: Execution discipline · Y-as: Structurele governance. Dotpositie representeert actuele driftstatus.
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Pattern learning</p>
            <p className="mt-2 text-sm text-white/90">{pattern.recurrent_patterns[0]}</p>
            <p className="mt-2 text-xs text-white/70">
              Stagnatie {pattern.stagnation_signals} · Escalatiefrequentie {pattern.escalation_frequency.toFixed(2)} / week
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
