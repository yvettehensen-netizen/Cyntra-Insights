import type { BoardEvaluationAggregate } from "@/cyntra/board-evaluation";

interface BoardScorecardProps {
  aggregate: BoardEvaluationAggregate;
}

type RadarAxis = {
  key:
    | "clarity_score"
    | "decision_certainty"
    | "risk_understanding"
    | "governance_trust"
    | "instrument_perception";
  label: string;
};

const AXES: RadarAxis[] = [
  { key: "clarity_score", label: "Helderheid" },
  { key: "decision_certainty", label: "Besluit" },
  { key: "risk_understanding", label: "Risico" },
  { key: "governance_trust", label: "Besturing" },
  { key: "instrument_perception", label: "Instrument" },
];

function polarPoint(
  index: number,
  total: number,
  radius: number,
  centerX: number,
  centerY: number
) {
  const startAngle = -Math.PI / 2;
  const angle = startAngle + (index / total) * Math.PI * 2;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

export default function BoardScorecard({ aggregate }: BoardScorecardProps) {
  const width = 360;
  const height = 320;
  const centerX = 180;
  const centerY = 158;
  const maxRadius = 108;
  const rings = [2, 4, 6, 8, 10];

  const polygonPoints = AXES.map((axis, index) => {
    const score = aggregate.averages[axis.key];
    const radius = (Math.max(0, Math.min(10, score)) / 10) * maxRadius;
    return polarPoint(index, AXES.length, radius, centerX, centerY);
  })
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <section
      className="rounded-3xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Board scorecard legitimiteitsindex"
    >
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
          Board Adoption & Legitimiteitsindex
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Bestuurlijke adoptie- en legitimiteitsscore
        </h2>
      </header>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0b1017] p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Radarchart board legitimiteitsmeting"
          >
            {rings.map((ring) => {
              const ringRadius = (ring / 10) * maxRadius;
              const points = AXES.map((_, index) =>
                polarPoint(index, AXES.length, ringRadius, centerX, centerY)
              )
                .map((point) => `${point.x},${point.y}`)
                .join(" ");
              return (
                <polygon
                  key={ring}
                  points={points}
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth={1}
                />
              );
            })}

            {AXES.map((axis, index) => {
              const point = polarPoint(index, AXES.length, maxRadius, centerX, centerY);
              const labelPoint = polarPoint(
                index,
                AXES.length,
                maxRadius + 20,
                centerX,
                centerY
              );
              return (
                <g key={axis.key}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                  />
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    fill="rgba(255,255,255,0.78)"
                    fontSize={11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            <polygon
              points={polygonPoints}
              fill="rgba(255,255,255,0.14)"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth={2}
            />

            {AXES.map((axis, index) => {
              const score = aggregate.averages[axis.key];
              const radius = (Math.max(0, Math.min(10, score)) / 10) * maxRadius;
              const point = polarPoint(index, AXES.length, radius, centerX, centerY);
              return (
                <circle
                  key={`${axis.key}-dot`}
                  cx={point.x}
                  cy={point.y}
                  r={3.8}
                  fill="white"
                  stroke="#0b1017"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard
            title="Board gemiddelde"
            value={aggregate.overall_average.toFixed(2)}
          />
          <MetricCard
            title="Spreiding min/max"
            value={`${aggregate.spread.min.toFixed(2)} / ${aggregate.spread.max.toFixed(2)}`}
          />
          <MetricCard
            title="Betrouwbaarheidsband"
            value={`${aggregate.confidence_band.lower.toFixed(2)} - ${aggregate.confidence_band.upper.toFixed(2)}`}
          />
          <MetricCard
            title="Board Adoption & Legitimiteitsindex"
            value={aggregate.board_adoption_legitimacy_index.toFixed(2)}
          />
          <article className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0b1017] p-4">
            <p className="text-xs uppercase tracking-[0.17em] text-white/55">
              Classificatie
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {aggregate.board_adoption_legitimacy_classification}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Respondenten: {aggregate.sample_size}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
      <p className="text-xs uppercase tracking-[0.17em] text-white/55">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}
