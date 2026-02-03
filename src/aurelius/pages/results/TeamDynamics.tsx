import ResultTemplate from "../../components/ResultTemplate";
import { Users, Zap, AlertTriangle } from "lucide-react";

export default function TeamDynamics() {
  return (
    <ResultTemplate
      title="Team Dynamics & Culture"
      subtitle="Collaboration, engagement, leadership load and execution climate"
      badge="Premium Report"
      visualImage="/assets/aurelius/visual-team.svg"
      security={{
        access: "premium",
        exportAllowed: false,
        watermark: true,
      }}
      isPremiumUser={false}
    >
      {/* METRICS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Team Health Indicators
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Engagement</div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">78%</div>
            <div className="text-sm text-gray-400">
              Improving, but fragile
            </div>
          </div>

          <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Collaboration</div>
            <div className="text-4xl font-bold text-green-400 mb-2">8.2 / 10</div>
            <div className="text-sm text-gray-400">
              Strong cross-team execution
            </div>
          </div>

          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Retention Risk</div>
            <div className="text-4xl font-bold text-red-400 mb-2">Elevated</div>
            <div className="text-sm text-gray-400">
              Leadership load unsustainable
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL TENSION */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6">
          Cultural Tension Points
        </h3>

        <ul className="space-y-3 text-gray-300">
          <li>• High performance expectations without recovery cycles</li>
          <li>• Decision-making concentrated at the top</li>
          <li>• Psychological safety uneven across teams</li>
        </ul>
      </section>

      {/* INTERVENTIONS */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6">
          Recommended Interventions
        </h3>

        <div className="space-y-4">
          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Immediate leadership load reduction and role clarification
          </div>

          <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <Zap className="w-5 h-5 inline mr-2" />
            Formalize ownership and accountability per initiative
          </div>

          <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
            <Users className="w-5 h-5 inline mr-2" />
            Introduce structured feedback and reflection cycles
          </div>
        </div>
      </section>
    </ResultTemplate>
  );
}
