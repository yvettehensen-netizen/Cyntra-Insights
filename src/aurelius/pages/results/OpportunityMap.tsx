import ResultTemplate from "../../components/ResultTemplate";
import { Map, TrendingUp, Target } from "lucide-react";

export default function OpportunityMap() {
  return (
    <ResultTemplate
      title="Opportunity Map"
      subtitle="Prioritized growth opportunities with ROI estimates and implementation roadmap"
      badge="Growth Report"
      visualImage="/assets/aurelius/visual-opportunity.svg"
    >
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Map className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">High-Priority Opportunities</h2>
        </div>

        <div className="space-y-6">
          {[
            {
              title: "E-commerce Platform Launch",
              impact: "€2.5M revenue potential",
              effort: "High",
              timeline: "6-9 months",
              roi: "320%",
            },
            {
              title: "BENELUX Market Expansion",
              impact: "€1.8M revenue potential",
              effort: "Medium",
              timeline: "3-6 months",
              roi: "240%",
            },
            {
              title: "Premium Product Line",
              impact: "€1.2M revenue potential",
              effort: "Medium",
              timeline: "4-6 months",
              roi: "180%",
            },
          ].map((opp, i) => (
            <div key={i} className="p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl hover:border-[#D4AF37]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#D4AF37]">#{i + 1}</span>
                    <h3 className="text-2xl font-bold text-white">{opp.title}</h3>
                  </div>
                  <p className="text-xl text-[#D4AF37] font-semibold">{opp.impact}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#D4AF37]">{opp.roi}</div>
                  <div className="text-sm text-gray-400">Expected ROI</div>
                </div>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <div>Effort: <span className="text-white font-semibold">{opp.effort}</span></div>
                <div>Timeline: <span className="text-white font-semibold">{opp.timeline}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ResultTemplate>
  );
}
