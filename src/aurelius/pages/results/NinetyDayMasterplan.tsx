import ResultTemplate from "../../components/ResultTemplate";
import { Calendar, CheckCircle, Target } from "lucide-react";

export default function NinetyDayMasterplan() {
  return (
    <ResultTemplate
      title="90-Day Masterplan"
      subtitle="Concrete action plan with milestones, owners, and KPIs for immediate execution"
      badge="Action Plan"
      visualImage="/assets/aurelius/visual-90day.svg"
    >
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">90-Day Roadmap</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* MONTH 1 */}
          <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#8B1538]/5 border border-[#8B1538]/30 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#8B1538]/30 rounded-lg text-[#D4AF37] text-sm font-semibold">
                Month 1
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Foundation</h3>
            <div className="space-y-3">
              {[
                { action: "Strategic workshop", owner: "CEO", week: "Week 2" },
                { action: "Market analysis", owner: "Marketing", week: "Week 3" },
                { action: "Set 3 priorities", owner: "MT", week: "Week 4" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="flex items-start gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <div className="text-sm font-semibold text-white">{item.action}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">{item.owner} • {item.week}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MONTH 2 */}
          <div className="p-6 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#D4AF37]/30 rounded-lg text-[#D4AF37] text-sm font-semibold">
                Month 2
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Implementation</h3>
            <div className="space-y-3">
              {[
                { action: "Build roadmaps", owner: "Project leads", week: "Week 6" },
                { action: "Test pricing strategy", owner: "Sales", week: "Week 7" },
                { action: "Launch quick wins", owner: "Operations", week: "Week 8" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="flex items-start gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <div className="text-sm font-semibold text-white">{item.action}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">{item.owner} • {item.week}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MONTH 3 */}
          <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/20 border border-white/20 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-lg text-white text-sm font-semibold">
                Month 3
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Optimization</h3>
            <div className="space-y-3">
              {[
                { action: "KPI dashboard live", owner: "BI/Analytics", week: "Week 10" },
                { action: "Impact measurement", owner: "MT", week: "Week 12" },
                { action: "Q2 strategy update", owner: "CEO", week: "Week 13" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="flex items-start gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <div className="text-sm font-semibold text-white">{item.action}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">{item.owner} • {item.week}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Success Factors</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            "MT commitment and ownership",
            "Weekly progress monitoring",
            "Clear communication to teams",
            "Budget allocation secured",
            "Dedicated project resources",
            "Stakeholder alignment",
          ].map((factor, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <span className="text-gray-200">{factor}</span>
            </div>
          ))}
        </div>
      </section>
    </ResultTemplate>
  );
}
