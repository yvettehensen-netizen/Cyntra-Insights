import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PlansPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "⚡ Losse Analyse",
      price: "€349",
      period: "eenmalig",
      description:
        "Voor organisaties die één diepgaande analyse willen via de Aurelius Engine 4.0.",
      features: [
        "1 volledige AI-analyse (7 domeinen)",
        "Executive Summary + Key Risks",
        "PDF-download",
      ],
      button: "Start Analyse",
      target: "/aurelius/analysis/strategy",
    },
    {
      name: "🏢 MKB Licentie",
      price: "€499",
      period: "per maand",
      description:
        "Voor bedrijven die maandelijks verbeterd willen worden door de Cyntra Portaal-analyse.",
      features: [
        "Maandelijkse deep-dive analyse",
        "Toegang tot portal & dashboards",
        "Voortgang & KPI monitoring",
      ],
      button: "Start Licentie",
      target: "/portal/dashboard",
      highlight: true,
    },
    {
      name: "💼 Corporate Partnership",
      price: "€999",
      period: "per maand",
      description:
        "Voor organisaties die maatwerk willen: integraties, onboarding en dedicated AI-consultants.",
      features: [
        "Volledig maatwerkrapport",
        "Eigen consultant & data-koppeling",
        "Enterprise onboarding",
      ],
      button: "Plan Demo",
      target: "/contact",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-8 py-24 font-inter">
      <div className="max-w-6xl mx-auto text-center">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h1 className="text-5xl font-playfair font-bold text-[#D6B48E] mb-4">
            Kies jouw AI-licentie
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ontwikkel een datagedreven organisatie met premium strategische analyses.
          </p>
        </motion.div>

        {/* PLANS GRID */}
        <div className="grid md:grid-cols-3 gap-10 mt-10">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={
                "relative rounded-2xl p-10 shadow-xl transition border border-white/10 bg-[#1A1A1A]" +
                (p.highlight
                  ? " scale-[1.03] bg-gradient-to-br from-[#8B1538] to-[#6D1028] border-[#D6B48E]"
                  : "")
              }
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D6B48E] text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  MEEST GEKOZEN
                </div>
              )}

              <h2 className="text-2xl font-semibold text-[#D6B48E]">{p.name}</h2>
              <p className="text-5xl font-bold text-white mt-4">{p.price}</p>
              <p className="text-gray-400">{p.period}</p>

              <p className="text-gray-300 mt-6">{p.description}</p>

              <ul className="space-y-2 mt-8 text-left text-gray-300 text-sm">
                {p.features.map((f, idx) => (
                  <li key={idx}>✅ {f}</li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(p.target)}
                className={
                  "w-full mt-10 py-3 font-semibold rounded-lg transition " +
                  (p.highlight
                    ? "bg-[#D6B48E] text-black hover:bg-[#caa87f]"
                    : "bg-white/10 text-white hover:bg-white/20")
                }
              >
                {p.button}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* WHY SECTION */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-28"
        >
          <h3 className="text-3xl font-playfair text-[#D6B48E] mb-6">
            Waarom kiezen organisaties voor Cyntra Aurelius 4.0?
          </h3>

          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <span className="px-4 py-2 border border-[#2A2A2A] rounded-lg">
              🤖 GPT-4o Strategische Engine
            </span>
            <span className="px-4 py-2 border border-[#2A2A2A] rounded-lg">
              📊 Executive-niveau rapportages
            </span>
            <span className="px-4 py-2 border border-[#2A2A2A] rounded-lg">
              🟣 McKinsey-style Insights
            </span>
            <span className="px-4 py-2 border border-[#2A2A2A] rounded-lg">
              🔒 Enterprise security
            </span>
            <span className="px-4 py-2 border border-[#2A2A2A] rounded-lg">
              🚀 90-day Roadmaps
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

