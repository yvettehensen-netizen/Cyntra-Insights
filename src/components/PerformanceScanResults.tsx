import React from "react";
import { motion } from "framer-motion";

type SectionResult = {
  score: number;
  summary: string;
};

type QuickscanResultsProps = {
  sections: Record<string, SectionResult>;
  averageScore: number;
};

export default function QuickscanResults({
  sections,
  averageScore,
}: QuickscanResultsProps) {
  const themeLabels: Record<string, string> = {
    growth: "📈 Growth",
    process: "⚙️ Process",
    financial: "💰 Financial",
    esg: "🌱 ESG",
    data: "💡 Data",
    market: "🧭 Market",
    organization: "🧬 Organization",
  };

  const getColor = (score: number) => {
    if (score >= 80) return "#4ade80"; // Groen
    if (score >= 65) return "#facc15"; // Geel
    return "#f87171"; // Rood
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 mt-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-[#D6B48E] mb-4 text-center">
        🔎 Quickscan Analyse Resultaten
      </h2>

      <div className="space-y-6">
        {Object.entries(sections).map(([key, data]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">{themeLabels[key]}</span>
              <span
                className="font-semibold"
                style={{ color: getColor(data.score) }}
              >
                {data.score}/100
              </span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.score}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: getColor(data.score),
                }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              {data.summary}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 mt-6 pt-4 text-center">
        <p className="text-lg font-semibold text-[#D6B48E]">
          Gemiddelde score:{" "}
          <span className="text-white">{averageScore}/100</span>
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Gebaseerd op 7 domeinen van digitale volwassenheid.
        </p>
      </div>
    </motion.div>
  );
}
