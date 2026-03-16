import React, { useMemo } from "react";

type Row = {
  captured_at: string;
  decision_velocity: number;
  ownership_clarity: number;
  escalation_friction: number;
  irreversibility_risk: number;
  overall_governance_health: number;
};

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function TimeSeriesChart({ series }: { series: Row[] }) {
  const width = 1100;
  const height = 320;
  const padding = 35;

  const points = useMemo(() => {
    const xs = series.map((_, i) => i);
    const ys = series.map((r) => toNum(r.overall_governance_health));

    const minX = 0;
    const maxX = Math.max(1, xs.length - 1);
    const minY = 0;
    const maxY = 100;

    const scaleX = (x: number) =>
      padding + (x - minX) * ((width - padding * 2) / (maxX - minX || 1));

    const scaleY = (y: number) =>
      height - padding - (y - minY) * ((height - padding * 2) / (maxY - minY || 1));

    const path = xs
      .map((x, i) => `${i === 0 ? "M" : "L"} ${scaleX(x)} ${scaleY(ys[i])}`)
      .join(" ");

    return { path, scaleX, scaleY };
  }, [series]);

  const last = series[series.length - 1];

  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-8 space-y-4">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-white">Time-series besluitverval</h2>
          <p className="text-white/45 text-sm">
            Trend van <span className="text-white/70">overall governance health</span> (0–100).
          </p>
        </div>
        <div className="text-white/40 text-sm">
          Laatste:{" "}
          <span className="text-[#d4af37] font-semibold">
            {last?.overall_governance_health ?? "—"}
          </span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
        {/* grid */}
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <line
              x1={35}
              x2={width - 35}
              y1={points.scaleY(y)}
              y2={points.scaleY(y)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text
              x={8}
              y={points.scaleY(y) + 4}
              fill="rgba(255,255,255,0.35)"
              fontSize="10"
            >
              {y}
            </text>
          </g>
        ))}

        {/* path */}
        <path d={points.path} fill="none" stroke="rgba(212,175,55,0.95)" strokeWidth="3" />

        {/* last point */}
        {series.length > 0 && (
          <circle
            cx={points.scaleX(series.length - 1)}
            cy={points.scaleY(toNum(last.overall_governance_health))}
            r="5"
            fill="rgba(212,175,55,1)"
          />
        )}
      </svg>

      <p className="text-white/35 text-xs">
        Interpretatie: dalende trend = besluitverval. Stijgende trend = closure-capaciteit groeit.
      </p>
    </section>
  );
}
