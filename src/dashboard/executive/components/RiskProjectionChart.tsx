import { motion } from "framer-motion";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskEvolutionResponse } from "../api/types";

interface RiskProjectionChartProps {
  data: RiskEvolutionResponse;
}

export default function RiskProjectionChart({ data }: RiskProjectionChartProps) {
  const observed = data.waargenomen_trend.slice(-30).map((row) => ({
    datum: row.datum,
    observed: row.score,
    projected: null,
    ondergrens: null,
    bovengrens: null,
    decay: null,
  }));

  const projected = data.projectie_90_dagen.map((row) => ({
    datum: row.datum,
    observed: null,
    projected: row.score,
    ondergrens: row.ondergrens,
    bovengrens: row.bovengrens,
    decay: row.confidence_decay,
  }));

  const chartData = [...observed, ...projected];

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Risk evolution modelling"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-white">Risico-evolutie Modellering</h2>
        <p className="text-xs text-white/55">Distributie, 90-dagen projectie, confidence-afname en acceleratievector.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-white/60">Risicoversnelling</p>
          <p className="mt-1 text-xl font-semibold text-white">{data.risico_acceleratie_vector.huidig.toFixed(2)}</p>
          <p className="text-xs text-white/55">Trend 7d: {data.risico_acceleratie_vector.trend_7d.toFixed(2)}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-white/60">Richting</p>
          <p className="mt-1 text-xl font-semibold text-white">{data.risico_acceleratie_vector.richting}</p>
          <p className="text-xs text-white/55">Afgeleid uit risk velocity-log.</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-white/60">Confidence (laatste)</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {data.confidence_decay_overlay.at(-1)?.confidence?.toFixed(1) ?? "0.0"}%
          </p>
          <p className="text-xs text-white/55">Gemeten op decision performance.</p>
        </article>
      </div>

      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="datum" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="risk" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
            <YAxis yAxisId="decay" orientation="right" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} width={34} />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#0a0f16",
              }}
            />

            <Area yAxisId="risk" type="monotone" dataKey="bovengrens" stroke="none" fill="rgba(83,126,194,0.2)" />
            <Area yAxisId="risk" type="monotone" dataKey="ondergrens" stroke="none" fill="#0f141c" />

            <Line yAxisId="risk" type="monotone" dataKey="observed" stroke="#d4af37" strokeWidth={2.2} dot={false} name="Waargenomen" />
            <Line yAxisId="risk" type="monotone" dataKey="projected" stroke="#f97316" strokeWidth={2.2} dot={false} name="Projectie" />
            <Line yAxisId="decay" type="monotone" dataKey="decay" stroke="#7dd3fc" strokeWidth={1.8} dot={false} name="Confidence-afname" />

            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Risicodistributie</p>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.risico_distributie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="band" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Bar dataKey="aantal" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
}
