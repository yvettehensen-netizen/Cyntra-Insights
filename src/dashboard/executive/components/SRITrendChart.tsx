import { motion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SriResponse } from "../api/types";

interface SRITrendChartProps {
  data: SriResponse;
  range: "7d" | "30d" | "90d";
  onRangeChange: (range: "7d" | "30d" | "90d") => void;
}

const bereikOpties: Array<{ label: string; value: "7d" | "30d" | "90d" }> = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

function dataVoorRange(data: SriResponse, range: "7d" | "30d" | "90d") {
  if (range === "7d") return data.sri_trend.slice(-7);
  if (range === "30d") return data.sri_trend.slice(-30);
  return data.sri_trend.slice(-90);
}

export default function SRITrendChart({ data, range, onRangeChange }: SRITrendChartProps) {
  const chartData = dataVoorRange(data, range);

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="SRI intelligentiepanel"
    >
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">SRI Intelligentiepaneel</h2>
          <p className="text-xs text-white/55">
            Bandtransities, freeze-triggers en volatiliteit in een trendbeeld.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-white/15 p-1">
          {bereikOpties.map((optie) => (
            <button
              key={optie.value}
              type="button"
              onClick={() => onRangeChange(optie.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                range === optie.value ? "bg-[#d4af37] text-[#1a1f27]" : "text-white/70 hover:bg-white/5"
              }`}
            >
              {optie.label}
            </button>
          ))}
        </div>
      </header>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="datum" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#0a0f16",
              }}
            />

            <ReferenceLine y={35} stroke="rgba(34,197,94,0.55)" strokeDasharray="4 4" label={{ value: "Autonomous", fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
            <ReferenceLine y={55} stroke="rgba(245,158,11,0.55)" strokeDasharray="4 4" label={{ value: "SRE", fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
            <ReferenceLine y={75} stroke="rgba(239,68,68,0.55)" strokeDasharray="4 4" label={{ value: "CTO Freeze", fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
            <ReferenceLine y={90} stroke="rgba(127,29,29,0.8)" strokeDasharray="4 4" label={{ value: "Exec Committee", fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />

            <Area
              type="monotone"
              dataKey="confidence_band_upper"
              stroke="none"
              fill="rgba(121,201,255,0.2)"
            />
            <Area
              type="monotone"
              dataKey="confidence_band_lower"
              stroke="none"
              fill="rgba(15,20,28,1)"
            />

            <Line type="monotone" dataKey="sri" stroke="#d4af37" strokeWidth={2.4} dot={false} name="SRI" />
            <Line type="monotone" dataKey="risicosnelheid" stroke="#f97316" strokeWidth={1.7} dot={false} name="Risicosnelheid" />

            {data.band_transities
              .filter((item) => chartData.some((row) => row.datum === item.datum))
              .map((item) => (
                <ReferenceDot
                  key={`${item.datum}-${item.naar}`}
                  x={item.datum}
                  y={chartData.find((row) => row.datum === item.datum)?.sri || 0}
                  r={4}
                  fill="#ef4444"
                  stroke="white"
                  label={{ value: `Band → ${item.naar}`, position: "top", fontSize: 10, fill: "rgba(255,255,255,0.62)" }}
                />
              ))}

            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-3 text-xs text-white/60">
        Volatiliteitsindicator: <span className="font-semibold text-white">{data.volatility_indicator.toFixed(2)}</span>
      </footer>
    </motion.section>
  );
}
