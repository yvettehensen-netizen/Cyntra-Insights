import ResultTemplate from "../../components/ResultTemplate";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function FinancialHealth() {
  return (
    <ResultTemplate
      title="Financial Health"
      subtitle="Cashflow, profitability, liquidity and financial resilience"
      badge="Premium Report"
      visualImage="/assets/aurelius/visual-financial.svg"
      security={{
        access: "premium",
        exportAllowed: false,
        watermark: true,
      }}
      isPremiumUser={false}
    >
      {/* OVERVIEW */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Financial Overview
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Growth */}
          <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Revenue Growth</div>
            <div className="text-4xl font-bold text-green-400 mb-2">+23%</div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              Year-over-year
            </div>
          </div>

          {/* Margin */}
          <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">EBITDA Margin</div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">18.5%</div>
            <div className="text-sm text-gray-400">
              Industry avg: 15.2% (monitoring scalability)
            </div>
          </div>

          {/* Cash */}
          <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Cash Position</div>
            <div className="text-4xl font-bold text-green-400 mb-2">€2.8M</div>
            <div className="text-sm text-green-400">
              Healthy liquidity buffer
            </div>
          </div>
        </div>
      </section>

      {/* RATIOS */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6">
          Key Financial Ratios
        </h3>

        <div className="space-y-4">
          {[
            { label: "Current Ratio", value: "2.8x", benchmark: "2.0+", status: "Healthy" },
            { label: "Quick Ratio", value: "1.8x", benchmark: "1.5+", status: "Healthy" },
            { label: "Debt-to-Equity", value: "0.4x", benchmark: "<1.0", status: "Low Risk" },
            { label: "Return on Equity", value: "22%", benchmark: "15%+", status: "Strong" },
          ].map((ratio, i) => (
            <div
              key={i}
              className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-white">
                  {ratio.label}
                </div>
                <div className="text-sm text-gray-400">
                  Benchmark: {ratio.benchmark}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-[#D4AF37]">
                  {ratio.value}
                </div>
                <div className="text-xs text-gray-400">
                  {ratio.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINANCIAL RISKS */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6">
          Financial Attention Points
        </h3>

        <ul className="space-y-3 text-gray-300">
          <li>• Margin pressure risk when scaling operations</li>
          <li>• Limited downside scenario buffers beyond 12 months</li>
          <li>• Capital allocation trade-offs between growth and resilience</li>
        </ul>
      </section>
    </ResultTemplate>
  );
}

