import { motion } from "framer-motion";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import type { PatternLearningResponse } from "../api/types";

interface PatternClusterMapProps {
  data: PatternLearningResponse;
}

export default function PatternClusterMap({ data }: PatternClusterMapProps) {
  const chartData = data.decision_pattern_clusters.map((cluster) => ({
    name: cluster.cluster_label,
    size: cluster.frequentie,
    stability: cluster.stabiliteit,
    acceleration: cluster.acceleratie,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Pattern learning"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Patroonleren</h2>
          <p className="text-xs text-white/55">Clusters, faalsignaturen, bottlenecks en leerdichtheid.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0a1017] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">Learning density</p>
          <p className="text-xl font-semibold text-[#d4af37]">{data.learning_density_score.toFixed(1)}</p>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-[240px] rounded-xl border border-white/10 bg-[#0a1017] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap data={chartData} dataKey="size" stroke="rgba(255,255,255,0.35)" fill="#d4af37">
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#0a0f16",
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Herhaalde faalsignaturen</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {data.herhaalde_faal_signaturen.slice(0, 4).map((item) => (
                <li key={item.signatuur} className="flex items-center justify-between text-white/75">
                  <span>{item.signatuur}</span>
                  <span className="text-white">{item.aantal}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Dominante bottlenecks</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {data.dominante_structurele_bottlenecks.slice(0, 4).map((item) => (
                <li key={item.naam} className="flex items-center justify-between text-white/75">
                  <span>{item.naam}</span>
                  <span className="text-white">impact {item.impact}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </motion.section>
  );
}
