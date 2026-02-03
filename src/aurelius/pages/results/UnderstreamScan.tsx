import ResultTemplate from "../../components/ResultTemplate";
import { Eye, Users, AlertCircle } from "lucide-react";

export default function UnderstreamScan() {
  return (
    <ResultTemplate
      title="Understream Scan"
      subtitle="Deep cultural analysis: unwritten rules, political dynamics, and organizational health"
      badge="Culture Report"
      visualImage="/assets/aurelius/visual-understream.svg"
    >
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Cultural Patterns</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-900/5 border border-green-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-green-400 mb-4">Positive Patterns</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Strong collaborative culture</li>
              <li>• High psychological safety</li>
              <li>• Transparent communication</li>
              <li>• Innovation encouragement</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-900/5 border border-orange-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Areas of Concern</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Hierarchical decision-making</li>
              <li>• Limited feedback loops</li>
              <li>• Silo mentality between departments</li>
              <li>• Risk aversion in middle management</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Leadership Dynamics</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl">
            <h4 className="font-bold text-white mb-3">Engagement Score: 78%</h4>
            <p className="text-gray-300">Above industry average of 72%. Strong team commitment and alignment with company vision.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#8B1538]/5 border border-[#8B1538]/30 rounded-xl">
            <h4 className="font-bold text-white mb-3">Psychological Safety: 7.8/10</h4>
            <p className="text-gray-300">Team members feel safe to speak up, take risks, and share ideas without fear of negative consequences.</p>
          </div>
        </div>
      </section>
    </ResultTemplate>
  );
}
