import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";

import {
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  Calendar,
  FileText,
  Layers,
  GaugeCircle,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";

export default function HowItWorksPage() {
  const features = [
    {
      icon: Layers,
      title: "13 AI Expert-Nodes",
      description:
        "Elke analyse wordt parallel uitgevoerd door 13 gespecialiseerde consultancy-modules: strategie, financiën, cultuur, onderstroom, executie, marktpositie, concurrentie en meer.",
    },
    {
      icon: AlertTriangle,
      title: "Brutal Mode",
      description:
        "De ongefilterde diagnose. Ontkenning, politiek, bias en ‘hoop-denken’ worden expliciet geïdentificeerd. Geen excuses. Geen rookgordijnen. Alleen de waarheid.",
    },
    {
      icon: GaugeCircle,
      title: "Vital Signs Monitoring",
      description:
        "Realtime beoordeling van vijf kritische bedrijfsparameters: cashflow pulse, retentie, team morale, execution velocity en decision quality.",
    },
    {
      icon: BarChart3,
      title: "Stress Test Engine",
      description:
        "5 scenario-simulaties zoals Revenue Shock, Margin Collapse, Talent Exodus en Competitor Blitz. Inclusief resilience-score (0–100%).",
    },
    {
      icon: BrainCircuit,
      title: "Onderstroom Analyse",
      description:
        "Diepgaande gedragsanalyse: cultuurpatronen, leiderschapsdynamiek, impliciete blokkades en communicatie-fricties die groei vertragen.",
    },
    {
      icon: Calendar,
      title: "90-Day Masterplan",
      description:
        "Een concreet, uitvoerbaar actieplan met owners, deadlines en KPI’s. Geen fluff — alleen praktische executie.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-6 py-24">

        {/* ---------------- HERO ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Hoe Cyntra Insights Werkt
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Aangedreven door de{" "}
            <span className="text-[#D6B48E] font-semibold">Aurelius Engine™</span>: 
            een consultancy-AI die in minuten doet wat een traditioneel bureau 
            2–3 weken kost. Parallel denken. Diepe analyses. Zero bias.
          </p>
        </motion.div>

        {/* ---------------- FEATURES GRID ---------------- */}
        <div className="grid md:grid-cols-2 gap-10 mb-32">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#1A1A1A]/80 backdrop-blur border border-[#D6B48E]/25 rounded-2xl p-8
                           hover:border-[#D6B48E]/50 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-[#D6B48E]/10 rounded-xl">
                    <Icon size={34} className="text-[#D6B48E]" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ---------------- REPORT PREVIEW ---------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#2d1319] to-[#1a0a0f] border border-[#D4AF37]/30 rounded-3xl p-12 mb-32 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <FileText size={32} className="text-[#D4AF37]" />
            <h2 className="text-3xl font-bold text-white">Wat zit er in het rapport?</h2>
          </div>

          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed text-lg">
              Je ontvangt een{" "}
              <span className="text-white font-semibold">boardroom-ready PDF (28–42 pagina’s)</span>{" "}
              inclusief alle strategische inzichten die een directie nodig heeft.
            </p>

            <ul className="space-y-3 ml-4">
              {[
                "Executive Summary (1 pagina kernanalyse)",
                "Vital Signs Dashboard",
                "Key Themes (top 5 strategische bevindingen)",
                "13 Deep Expert Insights",
                "Brutal Truths (ongefilterd en eerlijk)",
                "Top 8 Risks & Opportunities",
                "Stress-test rapportages",
                "Benchmarking tegen sector",
                "Volledig 90-Dagen Masterplan",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-lg">
                  <span className="text-[#D6B48E] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ---------------- CTA ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-[#D6B48E] mb-6">
            Klaar voor radicale helderheid?
          </h2>

          <p className="text-lg text-gray-300 mb-10">
            Begin met een gratis Quickscan of kies direct een volledige analyse.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/quickscan-gratis"
              className="px-10 py-4 bg-gradient-to-r from-[#D4AF37] to-[#b8974f] 
                         text-black font-bold rounded-xl shadow-xl 
                         hover:shadow-[#D4AF37]/40 transition-all text-lg"
            >
              Start Gratis Quickscan
            </Link>

            <Link
              to="/pricing"
              className="px-10 py-4 border border-[#D4AF37] text-[#D4AF37] font-bold rounded-xl 
                         hover:bg-[#D4AF37]/10 transition-all text-lg"
            >
              Bekijk Pakketten
            </Link>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
