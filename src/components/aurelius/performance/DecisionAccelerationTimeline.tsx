import type { PerformanceTrajectoryPoint } from "@/cyntra/performance-engine";

interface DecisionAccelerationTimelineProps {
  trajectory: PerformanceTrajectoryPoint[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function DecisionAccelerationTimeline({
  trajectory,
}: DecisionAccelerationTimelineProps) {
  const width = 860;
  const height = 260;
  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = trajectory.length
    ? trajectory
    : [
        { dag: 0, label: "Start", dsi: 0, verbetering_pct: 0, execution_score: 0 },
        { dag: 30, label: "30 dagen", dsi: 0, verbetering_pct: 0, execution_score: 0 },
        { dag: 60, label: "60 dagen", dsi: 0, verbetering_pct: 0, execution_score: 0 },
        { dag: 90, label: "90 dagen", dsi: 0, verbetering_pct: 0, execution_score: 0 },
      ];

  const x = (index: number) =>
    padX + (index / Math.max(1, points.length - 1)) * innerW;
  const yDsi = (value: number) => padY + (10 - clamp(value, 0, 10)) * (innerH / 10);
  const yExec = (value: number) => padY + (10 - clamp(value / 10, 0, 10)) * (innerH / 10);

  const dsiPolyline = points
    .map((point, index) => `${x(index)},${yDsi(point.dsi)}`)
    .join(" ");

  const execPolyline = points
    .map((point, index) => `${x(index)},${yExec(point.execution_score)}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1017] p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[680px]"
        role="img"
        aria-label="DSI- en executieversnellingstijdlijn"
      >
        {[0, 2, 4, 6, 8, 10].map((tick) => {
          const y = yDsi(tick);
          return (
            <g key={tick}>
              <line
                x1={padX}
                y1={y}
                x2={padX + innerW}
                y2={y}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="4 4"
              />
              <text x={8} y={y + 4} fill="rgba(255,255,255,0.62)" fontSize="10">
                {tick}
              </text>
            </g>
          );
        })}

        <polyline
          points={execPolyline}
          fill="none"
          stroke="rgba(59,130,246,0.75)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={dsiPolyline}
          fill="none"
          stroke="#F3D983"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={x(index)}
              cy={yDsi(point.dsi)}
              r="4.8"
              fill="#D4AF37"
              stroke="#fff"
              strokeWidth="1.3"
            />
            <text
              x={x(index)}
              y={height - 11}
              fill="rgba(255,255,255,0.72)"
              fontSize="11"
              textAnchor="middle"
            >
              {point.label}
            </text>
            <text
              x={x(index)}
              y={yDsi(point.dsi) - 10}
              fill="rgba(255,255,255,0.86)"
              fontSize="10"
              textAnchor="middle"
            >
              {point.dsi.toFixed(2)} ({point.verbetering_pct >= 0 ? "+" : ""}
              {point.verbetering_pct.toFixed(1)}%)
            </text>
          </g>
        ))}

        <text x={padX} y={16} fill="rgba(255,255,255,0.8)" fontSize="11">
          DSI
        </text>
        <text x={padX + 38} y={16} fill="rgba(59,130,246,0.85)" fontSize="11">
          Executiescore
        </text>
      </svg>
    </div>
  );
}
