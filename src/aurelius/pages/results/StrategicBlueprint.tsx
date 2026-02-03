import ResultTemplate from "../../components/ResultTemplate";
import { Target, TrendingUp, Zap } from "lucide-react";

export default function StrategicBlueprint() {
  const priorities = [
    { title: "Market Expansion", impact: "High", timeline: "Q1–Q2 2025" },
    { title: "Digital Transformation", impact: "High", timeline: "Q2–Q4 2025" },
    { title: "Operational Excellence", impact: "Medium", timeline: "Q1–Q3 2025" },
  ];

  const recommendations = [
    {
      title: "Accelerate Digital Transformation",
      description:
        "Invest in e-commerce platform, automation and digital go-to-market capabilities.",
      priority: "Critical",
    },
    {
      title: "Expand BENELUX Footprint",
      description:
        "Form strategic partnerships in Belgium and Luxembourg to accelerate growth.",
      priority: "High",
    },
    {
      title: "Optimize Cost Structure",
      description:
        "Reduce operational overhead through process automation and clearer ownership.",
      priority: "High",
    },
  ];

  return (
    <ResultTemplate
      title="Strategic Blueprint"
      subtitle="Board-level strategic analysis with priorities, SWOT and execution focus"
      badge="Premium Report"
      visualImage="/assets/aurelius/visual-strategic.svg"
      security={{
        access: "premium",
        exportAllowed: false,
        watermark: true,
      }}
      isPremiumUser={false} // later uit auth / subscription
    >
      {/* STRATEGIC PRIORITIES */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Strategische Prioriteiten
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {priorities.map((priority, i) => (
            <div
              key={i}
              className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl hover:border-[#D4AF37]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-[#D4AF37]">
                  #{i + 1}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    priority.impact === "High"
                      ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                      : "bg-gray-600/20 text-gray-400"
                  }`}
                >
                  {priority.impact} Impact
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {priority.title}
              </h3>
              <p className="text-gray-400 text-sm">
                Timeline: {priority.timeline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SWOT */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">SWOT Analyse</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-green-400 mb-4">Strengths</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Strong product-market fit</li>
              <li>• High customer satisfaction</li>
              <li>• Experienced leadership</li>
            </ul>
          </div>

          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-red-400 mb-4">Weaknesses</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Execution bottlenecks</li>
              <li>• Dependency on key accounts</li>
              <li>• Limited automation</li>
            </ul>
          </div>

          <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Opportunities</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Regional expansion</li>
              <li>• Pricing optimization</li>
              <li>• Strategic partnerships</li>
            </ul>
          </div>

          <div className="p-6 bg-orange-900/20 border border-orange-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Threats</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Competitive pressure</li>
              <li>• Talent attrition</li>
              <li>• Margin erosion</li>
            </ul>
          </div>
        </div>
      </section>

      {/* KEY RECOMMENDATIONS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Key Recommendations
          </h2>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rec.priority === "Critical"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-[#D4AF37]/20 text-[#D4AF37]"
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="text-gray-400">{rec.description}</p>
            </div>
          ))}
        </div>
      </section>
    </ResultTemplate>
  );
}
