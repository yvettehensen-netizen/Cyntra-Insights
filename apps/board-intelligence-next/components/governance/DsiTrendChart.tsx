import type { DsiPoint } from "@/lib/cd-types";

interface DsiTrendChartProps {
  points: DsiPoint[];
  height?: number;
}

export default function DsiTrendChart({ points, height = 240 }: DsiTrendChartProps) {
  if (!points.length) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
        No DSI points for the selected 90 day window.
      </div>
    );
  }

  const width = 900;
  const pad = 36;
  const values = points.map((entry) => entry.dsi);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 100);
  const span = Math.max(1, maxValue - minValue);

  const toX = (index: number) => pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const toY = (value: number) => height - pad - ((value - minValue) / span) * (height - pad * 2);

  const path = points
    .map((entry, index) => `${index === 0 ? "M" : "L"}${toX(index)},${toY(entry.dsi)}`)
    .join(" ");

  const latest = points[points.length - 1];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <p>DSI Trend (90 days)</p>
        <p>
          Latest <span className="font-semibold text-slate-100">{latest.dsi.toFixed(2)}</span>
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="DSI trend over 90 days">
        <defs>
          <linearGradient id="dsiLineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line x1={pad} x2={width - pad} y1={y} y2={y} stroke="#1f2937" strokeDasharray="3 3" />
              <text x={8} y={y + 4} fontSize="10" fill="#94a3b8">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke="url(#dsiLineGradient)" strokeWidth={2.5} />

        {points.map((entry, index) => (
          <circle
            key={`${entry.date}-${index}`}
            cx={toX(index)}
            cy={toY(entry.dsi)}
            r={2.2}
            fill="#e2e8f0"
          >
            <title>
              {entry.date} • DSI {entry.dsi.toFixed(2)} • Conflicts {entry.conflict_count} • Exec {entry.execution_speed.toFixed(2)}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
