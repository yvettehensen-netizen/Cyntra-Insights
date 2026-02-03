import { Link } from "react-router-dom";
import {
  Brain,
  BarChart3,
  LineChart,
  Users,
  Shield,
  Cpu,
  Workflow,
  Boxes,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function AureliusHome() {
  const tools = [
    { title: "Strategische Analyse", icon: Brain, path: "/portal/analyse/strategy" },
    { title: "Markt & Concurrentie", icon: BarChart3, path: "/portal/analyse/market" },
    { title: "Financiële Gezondheid", icon: LineChart, path: "/portal/analyse/finance" },
    { title: "Proces & Operatie", icon: Workflow, path: "/portal/analyse/process" },
    { title: "AI & Data", icon: Cpu, path: "/portal/analyse/ai-data" },
    { title: "Team & Cultuur", icon: Users, path: "/portal/analyse/team" },
    { title: "Veranderkracht", icon: Shield, path: "/portal/analyse/resilience" },
    { title: "SWOT Overzicht", icon: Boxes, path: "/portal/analyse/swot" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#0F0B10] to-[#0A090A] text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-8">
            <Lock className="text-[#D4AF37]" size={18} />
            <span className="text-sm text-[#D4AF37]">Besloten omgeving</span>
          </div>

          <h1 className="text-6xl font-bold mb-8">Aurelius Portal</h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Selecteer een analyse om direct strategisch inzicht te verkrijgen.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.path}
                className="group bg-black/50 border border-white/10 rounded-3xl p-8 hover:border-[#D4AF37]/40 transition shadow-xl hover:-translate-y-2"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#D4AF37]/15 mb-6">
                  <Icon className="text-[#D4AF37]" size={28} />
                </div>

                <h2 className="text-xl font-bold mb-3 group-hover:text-[#D4AF37]">
                  {tool.title}
                </h2>

                <span className="text-sm text-[#D4AF37] flex items-center gap-2">
                  Start analyse <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-24 text-center text-sm text-gray-500">
          Alle analyses zijn vertrouwelijk • Geen training op klantdata • EU-gehost
        </div>
      </div>
    </div>
  );
}
