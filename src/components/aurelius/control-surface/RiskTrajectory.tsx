import type {
  RiskEvolutionIntelligenceSignal,
  RiskTrajectoryOutput,
} from "@/cyntra/intelligence/types";

interface RiskTrajectoryProps {
  trajectory: RiskTrajectoryOutput;
  evolution: RiskEvolutionIntelligenceSignal;
}

export default function RiskTrajectory({ trajectory, evolution }: RiskTrajectoryProps) {
  const width = 860;
  const height = 260;
  const padX = 34;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const y = (value: number) =>
    padY + (100 - Math.max(0, Math.min(100, value))) * (innerH / 100);

  const p0 = { x: padX, y: y(trajectory.current_risk_score) };
  const p1 = { x: padX + innerW * 0.33, y: y(evolution.projection_30d) };
  const p2 = { x: padX + innerW, y: y(evolution.projection_90d) };

  const bandTop = y(evolution.confidence_band[1]);
  const bandBottom = y(evolution.confidence_band[0]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5" aria-label="Risk Trajectory">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Risk Trajectory</p>
          <h2 className="mt-1 text-xl font-semibold text-white">90-dagen risicoverloop</h2>
        </div>
        <div className="text-right text-sm text-white/75">
          <p>
            Confidence band:{" "}
            <span className="font-semibold text-amber-300">
              {evolution.confidence_band[0].toFixed(1)} - {evolution.confidence_band[1].toFixed(1)}
            </span>
          </p>
          <p className="text-xs text-white/65">
            Acceleratie {evolution.risk_acceleration.toFixed(2)} · Drift intensification{" "}
            {evolution.drift_intensification.toFixed(1)}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1017]">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] w-full" role="img" aria-label="Risk trajectory SVG">
          <rect x="0" y="0" width={width} height={height} fill="transparent" />

          {[0, 25, 50, 75, 100].map((tick) => {
            const yTick = y(tick);
            return (
              <g key={tick}>
                <line x1={padX} y1={yTick} x2={padX + innerW} y2={yTick} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
                <text x={6} y={yTick + 4} fill="rgba(255,255,255,0.65)" fontSize="10">
                  {tick}
                </text>
              </g>
            );
          })}

          <rect
            x={p2.x - 16}
            y={Math.min(bandTop, bandBottom)}
            width={32}
            height={Math.abs(bandBottom - bandTop)}
            fill="rgba(59,130,246,0.2)"
            stroke="rgba(125,211,252,0.45)"
          />

          <polyline
            points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
            fill="none"
            stroke="#F3D983"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx={p0.x} cy={p0.y} r="4.5" fill="#D4AF37" />
          <circle cx={p1.x} cy={p1.y} r="4.5" fill="#D4AF37" />
          <circle cx={p2.x} cy={p2.y} r="4.5" fill="#D4AF37" />

          <text x={p0.x - 6} y={height - 10} fill="rgba(255,255,255,0.7)" fontSize="11">
            Nu
          </text>
          <text x={p1.x - 20} y={height - 10} fill="rgba(255,255,255,0.7)" fontSize="11">
            30 dagen
          </text>
          <text x={p2.x - 20} y={height - 10} fill="rgba(255,255,255,0.7)" fontSize="11">
            90 dagen
          </text>
        </svg>
      </div>

      {evolution.drift_alarm ? (
        <div className="mt-3 rounded-xl border border-red-400/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          Drift alarm actief: risk acceleration overschrijdt threshold.
        </div>
      ) : null}
    </section>
  );
}
