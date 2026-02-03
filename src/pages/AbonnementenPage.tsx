import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AbonnementenPage() {
  const navigate = useNavigate();

  const pakketten = [
    {
      naam: "Losse Analyse",
      prijs: "€349",
      beschrijving:
        "Eénmalige strategische analyse met volledig AI-rapport en aanbevelingen op maat.",
      functies: [
        "Volledig AI-gegenereerd rapport",
        "Downloadbaar PDF-resultaat",
        "1 onderwerp (Growth, Process, ESG etc.)",
      ],
      knop: "Bestel Losse Analyse",
      kleur: "border-[#D6B48E] bg-transparent",
    },
    {
      naam: "MKB Abonnement",
      prijs: "vanaf €499 / maand",
      beschrijving:
        "Maandelijks AI-abonnement voor middelgrote bedrijven. Inclusief 3 analyses per maand en toegang tot dashboard.",
      functies: [
        "3 analyses per maand",
        "Toegang tot AI-dashboard",
        "Maandelijkse voortgangsrapporten",
        "Prioritaire support",
      ],
      knop: "Plan demo",
      kleur: "bg-[#D6B48E] text-black border-[#D6B48E]",
    },
    {
      naam: "Corporate Partnership",
      prijs: "€999 / maand",
      beschrijving:
        "Enterprise partnership voor grote organisaties met diepgaande rapportages en maatwerk AI-modellen.",
      functies: [
        "Onbeperkt analyses",
        "Eigen AI-datamodel",
        "Strategische sessies met consultant",
        "Volledige API-toegang",
      ],
      knop: "Neem contact op",
      kleur: "border-[#D6B48E] bg-transparent",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white py-20 px-6 font-inter">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-playfair font-bold text-[#D6B48E] mb-4"
        >
          💼 Cyntra Abonnementen
        </motion.h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Kies het pakket dat bij jouw organisatie past. Alle analyses worden
          uitgevoerd met geavanceerde AI-modellen en leveren concrete, toepasbare inzichten.
        </p>
      </div>

      {/* Pakketten */}
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {pakketten.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-2xl border ${p.kleur} hover:shadow-xl transition transform hover:-translate-y-1`}
          >
            <h2 className="text-2xl font-semibold text-[#D6B48E] mb-2">
              {p.naam}
            </h2>
            <p className="text-gray-400 mb-4">{p.beschrijving}</p>
            <p className="text-3xl font-bold text-[#D6B48E] mb-6">{p.prijs}</p>
            <ul className="text-gray-300 text-sm space-y-2 mb-6">
              {p.functies.map((f, idx) => (
                <li key={idx}>✅ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup")}
              className={`w-full py-3 rounded-lg font-semibold border ${p.kleur} hover:bg-[#cba87f] hover:text-black transition`}
            >
              {p.knop}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-20 text-gray-500 text-sm">
        <p>
          © 2025 Cyntra Insights — AI Business Intelligence Suite <br />
          <a href="/privacy" className="text-[#D6B48E] hover:underline">
            Privacyverklaring
          </a>{" "}
          •{" "}
          <a href="/ai-code" className="text-[#D6B48E] hover:underline">
            AI Gedragscode
          </a>{" "}
          •{" "}
          <a href="/voorwaarden" className="text-[#D6B48E] hover:underline">
            Algemene Voorwaarden
          </a>
        </p>
      </div>
    </div>
  );
}
