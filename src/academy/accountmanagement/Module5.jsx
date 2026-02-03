import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module5() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is de belangrijkste rol van data in modern accountmanagement?",
      options: [
        "Data vervangt menselijk contact",
        "Data biedt inzicht om beter te adviseren en te sturen",
        "Data is alleen nuttig voor rapportages",
        "Data zorgt ervoor dat je minder hoeft te luisteren",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Wat betekent CRM in de praktijk?",
      options: [
        "Customer Relationship Management – een systeem om klantrelaties te beheren",
        "Customer Revenue Model – winst per klant berekenen",
        "Client Retention Matrix – loyaliteit meten",
        "Customer Response Mechanism – klachten registreren",
      ],
      correct: 0,
    },
    {
      id: 3,
      question: "Wat is een KPI?",
      options: [
        "Key Performance Indicator",
        "Klant Prestatie Index",
        "Kwalitatieve Proces Indicator",
        "Key Partner Informatie",
      ],
      correct: 0,
    },
    {
      id: 4,
      question: "Wat is een voorbeeld van een datagedreven actie?",
      options: [
        "Een gevoel volgen tijdens onderhandelingen",
        "Een klantsegment benaderen op basis van aankoopgedrag",
        "Een meeting plannen zonder doel",
        "Een prijs bepalen op basis van concurrentgeruchten",
      ],
      correct: 1,
    },
  ];

  const handleAnswer = (qid, index) => setAnswers({ ...answers, [qid]: index });
  const handleSubmit = () => {
    const correctCount = questions.filter(q => answers[q.id] === q.correct).length;
    setScore(correctCount);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-16 font-inter">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-[#D6B48E] mb-4">
            Module 5 – Data & De Digitale Accountmanager
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            De moderne accountmanager gebruikt data, technologie en AI om beslissingen te versterken.  
            In deze module leer je hoe digitale tools je helpen om slimmer, sneller en persoonlijker met klanten te werken.
          </p>
        </header>

        {/* Theorieblok 1 – Datagedreven werken */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">📊 1. Datagedreven werken</h2>
          <p className="text-gray-300 leading-relaxed">
            Data verandert de rol van de accountmanager.  
            Waar intuïtie ooit leidend was, is nu inzicht en analyse essentieel.  
            Datagedreven werken betekent: beslissen op basis van feiten, niet aannames.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Gebruik data om trends en klantgedrag te herkennen</li>
            <li>Combineer cijfers met context – data vertelt het <em>wát</em>, gesprekken het <em>waarom</em></li>
            <li>Visualiseer inzichten zodat klanten ze begrijpen</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Data zonder actie is informatie. Actie zonder data is gokken.”
          </blockquote>
        </section>

        {/* Theorieblok 2 – CRM & Klantdata */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">💼 2. CRM & Klantdata</h2>
          <p className="text-gray-300 leading-relaxed">
            Een CRM (Customer Relationship Management)-systeem is het digitale geheugen van je klantrelaties.  
            Hier bewaar je contactmomenten, kansen en gespreksverslagen, zodat je nooit meer ‘op gevoel’ werkt.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Gebruik CRM om follow-ups te plannen en prioriteiten te stellen</li>
            <li>Registreer inzichten, niet alleen feiten</li>
            <li>Gebruik AI-suggesties voor volgende acties of cross-sell kansen</li>
          </ul>
        </section>

        {/* Theorieblok 3 – KPI’s en Dashboards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">📈 3. KPI’s en Dashboards</h2>
          <p className="text-gray-300 leading-relaxed">
            KPI’s (Key Performance Indicators) meten de resultaten die er toe doen.  
            Ze maken voortgang zichtbaar en helpen om focus te houden.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Omzet-KPI:</strong> omzetgroei per klant</li>
            <li><strong>Relatie-KPI:</strong> Net Promoter Score (NPS)</li>
            <li><strong>Activiteits-KPI:</strong> aantal strategische gesprekken per maand</li>
          </ul>
          <p className="text-gray-400">
            Dashboards maken in één oogopslag zichtbaar waar de kansen liggen – en waar je moet bijsturen.
          </p>
        </section>

        {/* Theorieblok 4 – AI en Digitale Tools */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤖 4. AI & Digitale Tools</h2>
          <p className="text-gray-300 leading-relaxed">
            AI helpt je om sneller te analyseren en persoonlijker te communiceren.  
            Denk aan tools voor voorspellende analyses, sentimentanalyse en automatische rapportages.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Gebruik AI voor analyse van klantdata en trends</li>
            <li>Laat AI coach je gesprekstechnieken verbeteren</li>
            <li>Automatiseer repeterend werk om meer tijd te hebben voor relaties</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “De beste accountmanagers worden niet vervangen door AI – ze worden beter door AI.”
          </blockquote>
        </section>

        {/* Quiz */}
        <section className="space-y-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🎯 Kennischeck</h2>
          {questions.map(q => (
            <div key={q.id} className="space-y-2">
              <p className="text-gray-300">{q.question}</p>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, i)}
                  className={`block w-full text-left px-4 py-2 rounded-lg border transition ${
                    answers[q.id] === i
                      ? "bg-[#D6B48E] text-black border-[#D6B48E]"
                      : "bg-[#121212] border-[#2A2A2A] hover:bg-[#2A2A2A]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f]"
          >
            Controleer antwoorden
          </button>

          {score !== null && (
            <p className="text-gray-400 mt-4">
              Je score: {score}/{questions.length}{" "}
              {score === questions.length
                ? "✅ Top – je denkt en werkt datagedreven!"
                : "💡 Goed bezig – versterk je inzicht in digitale tools."}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Hoe gebruik jij nu data om beslissingen te onderbouwen?</li>
            <li>Welke KPI’s zijn voor jou het meest relevant?</li>
            <li>Welke digitale tool zou je dagelijkse werk kunnen verbeteren?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">Gebruik deze prompts om datagedreven te groeien:</p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Analyseer mijn huidige KPI's en geef drie voorstellen om deze beter af te stemmen op klantwaarde.

Welke digitale tools kan ik integreren in mijn accountmanagementproces om meer inzichten en tijd te winnen?`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <Link
            to="/academy/accountmanagement/module/4"
            className="px-6 py-2 bg-[#2A2A2A] text-gray-400 rounded-lg font-semibold hover:bg-[#3A3A3A]"
          >
            ← Vorige module
          </Link>
          <Link
            to="/academy/accountmanagement/module/6"
            className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f]"
          >
            Volgende module →
          </Link>
        </footer>
      </div>
    </div>
  );
}
