import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "./ProgressContext";

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markComplete } = useProgress();

  const modules: Record<string, { title: string; content: string; reflection: string }> = {
    "1": {
      title: "Strategisch Fundament",
      content: `In het AI-tijdperk verandert accountmanagement radicaal. 
      Waar vroeger relaties centraal stonden, draait het nu om datagedreven besluitvorming, 
      voorspellende inzichten en strategische waardecreatie. 
      Een moderne accountmanager gebruikt AI om klantbehoeften te anticiperen en de waarde van accounts proactief te vergroten.`,
      reflection: "Hoe verandert jouw rol als accountmanager door de komst van AI?",
    },
    "2": {
      title: "Datagedreven Klantinzicht",
      content: `Data zijn de nieuwe grondstof van klantrelaties. 
      Door klantdata te analyseren — aankooppatronen, sentiment, segmentatie — 
      kun je kansen vroegtijdig herkennen. AI helpt bij het voorspellen van churn, upsell-potentie en tevredenheid.`,
      reflection: "Welke type klantdata kun jij vandaag al gebruiken om beter te adviseren?",
    },
    "3": {
      title: "Strategie & Groeiplan",
      content: `Gebruik frameworks zoals Ansoff of BCG om groeikansen te identificeren. 
      Stel KPI’s vast per account en koppel ze aan duidelijke AI-signalen, zoals omzetvoorspellingen of klantactiviteit. 
      AI vervangt geen strategie — het versterkt hem.`,
      reflection: "Wat is een concrete groeikans die je via data kunt aantonen?",
    },
    "4": {
      title: "Executive Rapport & Certificering",
      content: `Je rondt de training af met een AI-gestuurd accountplan of executive rapport. 
      Dit document vat jouw inzichten, doelen en AI-analyse samen — klaar voor gebruik in managementpresentaties.`,
      reflection: "Wat zou jij opnemen in jouw executive rapport?",
    },
  };

  const module = modules[id || "1"];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-100 p-8 font-inter max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#D6B48E] mb-6">{module.title}</h1>
      <p className="text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{module.content}</p>

      <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A] mb-6">
        <h3 className="text-lg font-semibold text-[#D6B48E] mb-2">Reflectievraag</h3>
        <p className="text-gray-400 mb-4">{module.reflection}</p>
        <textarea
          placeholder="Typ je antwoord hier..."
          className="w-full p-3 rounded-lg bg-[#1E1E1E] text-gray-200 text-sm outline-none border border-[#2A2A2A]"
          rows={4}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate("/training")}
          className="text-gray-400 hover:text-[#D6B48E] transition"
        >
          ← Terug naar overzicht
        </button>
        <button
          onClick={() => {
            markComplete(id || "");
            navigate("/training");
          }}
          className="bg-[#D6B48E] text-black font-semibold px-6 py-2 rounded-lg hover:bg-[#caa87f] transition"
        >
          Markeer als voltooid
        </button>
      </div>
    </div>
  );
}
