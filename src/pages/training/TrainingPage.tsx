import React from "react";
import { Link } from "react-router-dom";
import { useProgress } from "./ProgressContext";

export default function TrainingPage() {
  const { progress } = useProgress();

  const modules = [
    { id: "1", title: "Strategisch Fundament", desc: "De nieuwe rol van de accountmanager in het AI-tijdperk." },
    { id: "2", title: "Datagedreven Klantinzicht", desc: "Gebruik AI om klantgedrag te voorspellen en waarde te maximaliseren." },
    { id: "3", title: "Strategie & Groeiplan", desc: "Vertaal data naar actiegerichte accountplannen." },
    { id: "4", title: "Executive Rapport & Certificering", desc: "Rond af met een AI-rapport en ontvang je certificaat." },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-100 p-8 font-inter">
      <h1 className="text-3xl font-bold text-[#D6B48E] mb-6 text-center">
        Cyntra AI Accountmanagement Training
      </h1>
      <p className="text-gray-400 text-center mb-10">
        Ontwikkel jezelf tot een AI-gedreven accountmanager. Rond alle modules af en ontvang een officieel Cyntra-certificaat.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((m) => (
          <Link
            key={m.id}
            to={`/training/module/${m.id}`}
            className={`border border-[#2A2A2A] rounded-xl p-6 transition ${
              progress[m.id] ? "bg-[#1A1A1A]/70 border-[#D6B48E]" : "bg-[#141414]"
            } hover:bg-[#1E1E1E]`}
          >
            <h2 className="text-xl font-semibold text-[#D6B48E] mb-2">{m.title}</h2>
            <p className="text-sm text-gray-400 mb-4">{m.desc}</p>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                progress[m.id] ? "bg-[#D6B48E] text-black w-fit" : "bg-gray-700 text-gray-300 w-fit"
              }`}
            >
              {progress[m.id] ? "Voltooid" : "Nog niet voltooid"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
