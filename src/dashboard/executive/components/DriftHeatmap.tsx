import { motion } from "framer-motion";
import type { DriftResponse, Severity } from "../api/types";

interface DriftHeatmapProps {
  data: DriftResponse;
}

function kleurVoorSeverity(severity: Severity) {
  if (severity === "critical") return "bg-red-600/85";
  if (severity === "high") return "bg-orange-500/80";
  if (severity === "medium") return "bg-amber-400/70";
  return "bg-emerald-500/70";
}

function tekstVoorSeverity(severity: Severity) {
  if (severity === "critical") return "text-red-200";
  if (severity === "high") return "text-orange-200";
  if (severity === "medium") return "text-amber-200";
  return "text-emerald-200";
}

export default function DriftHeatmap({ data }: DriftHeatmapProps) {
  const datums = Array.from(new Set(data.drift_intensiteit_heatmap.map((cell) => cell.datum))).slice(-14);
  const types = Array.from(new Set(data.drift_intensiteit_heatmap.map((cell) => cell.drift_type)));

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="rounded-2xl border border-white/10 bg-[#0f141c] p-5"
      aria-label="Drift analytics"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-white">Driftanalyse</h2>
        <p className="text-xs text-white/55">Intensiteit, clusters, classificatie en besluitomkeringen.</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1" role="grid" aria-label="Drift intensiteit heatmap">
          <thead>
            <tr>
              <th className="w-[140px]" />
              {datums.map((datum) => (
                <th key={datum} className="text-[10px] font-medium text-white/55">
                  {datum.slice(5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((driftType) => (
              <tr key={driftType}>
                <th className="pr-2 text-left text-[11px] text-white/60">{driftType}</th>
                {datums.map((datum) => {
                  const cell = data.drift_intensiteit_heatmap.find(
                    (item) => item.datum === datum && item.drift_type === driftType
                  );
                  const intensiteit = cell?.intensiteit || 0;
                  const severity = cell?.severity || "low";

                  return (
                    <td key={`${driftType}-${datum}`}>
                      <div
                        className={`h-8 rounded-md border border-white/10 text-center text-[10px] font-semibold text-[#0f141c] ${kleurVoorSeverity(severity)}`}
                        title={`${driftType} op ${datum}: ${intensiteit.toFixed(2)} (${severity})`}
                      >
                        <span className="relative top-[6px]">{intensiteit.toFixed(0)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Severity-classificatie</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data.severity_classificatie).map(([severity, aantal]) => (
              <div key={severity} className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5">
                <span className={`text-xs uppercase ${tekstVoorSeverity(severity as Severity)}`}>{severity}</span>
                <p className="font-semibold text-white">{aantal}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0a1017] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Besluitomkeringen</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">{data.besluit_omkeringen_detectie.aantal}</p>
          <p className="text-xs text-white/55">Detecties op high/critical drift-signaturen.</p>
        </article>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Driftclusters</p>
        <div className="space-y-2">
          {data.drift_clusters.slice(0, 5).map((cluster) => (
            <div key={cluster.cluster} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0a1017] px-3 py-2">
              <p className="text-sm text-white">{cluster.cluster}</p>
              <p className="text-xs text-white/60">
                Gem: <span className="text-white">{cluster.gemiddelde_score.toFixed(1)}</span> · Events: {cluster.aantal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
