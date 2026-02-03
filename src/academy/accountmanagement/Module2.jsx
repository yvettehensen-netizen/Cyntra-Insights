import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module2() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is het doel van een SWOT-analyse?",
      options: [
        "Om interne en externe factoren te identificeren die invloed hebben op een organisatie",
        "Om de winst te berekenen",
        "Om verkoopdoelen vast te stellen",
        "Om klanttevredenheid te meten",
      ],
      correct: 0,
    },
    {
      id: 2,
      question: "Wat analyseert het 5-krachtenmodel van Porter?",
      options: [
        "De financiële resultaten van een organisatie",
        "De concurrentiedynamiek in een markt",
        "De interne structuur van een bedrijf",
        "De communicatiestijl van accountmanagers",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "Welke groeistrategie hoort bij de Ansoff-matrix wanneer een bedrijf nieuwe producten aanbiedt aan bestaande klanten?",
      options: [
        "Marktpenetratie",
        "Productontwikkeling",
        "Marktontwikkeling",
        "Diversificatie",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Wat is het doel van klantsegmentatie?",
      options: [
        "Om klanten in groepen te verdelen op basis van kenmerken en gedrag",
        "Om verkoopgesprekken te standaardiseren",
        "Om prijzen per klant te bepalen",
        "Om de concurrentiepositie te meten",
      ],
      correct: 0,
    },
  ];

  const handleAnswer = (qid, index) => {
    setAnswers({ ...answers, [qid]: index });
  };

  const handleSubmit = () => {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correct
    ).length;
    setScore(correctCount);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-16 font-inter">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-[#D6B48E] mb-4">
            Module 2 – Verdieping in Accountmanagement
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            In deze module verdiep je je in strategische analyses. 
            Je leert klant- en marktsituaties te analyseren met modellen als SWOT, 
            PESTEL, Ansoff, BCG en het 5-krachtenmodel van Porter. 
            Deze kennis helpt je om klanten beter te begrijpen, segmenteren en adviseren.
          </p>
        </header>

        {/* Theorieblok 1 - SWOT */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            📊 1. SWOT-analyse & Confrontatiematrix
          </h2>
          <p className="text-gray-300 leading-relaxed">
            De SWOT-analyse helpt je om de interne sterktes en zwaktes van een organisatie 
            te koppelen aan externe kansen en bedreigingen. 
            Op basis daarvan kun je strategieën bepalen.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>S</strong> – Strengths (Sterktes)</li>
            <li><strong>W</strong> – Weaknesses (Zwaktes)</li>
            <li><strong>O</strong> – Opportunities (Kansen)</li>
            <li><strong>T</strong> – Threats (Bedreigingen)</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Een sterke SWOT leidt tot inzicht in hoe je klant écht kan groeien – 
            en hoe jij daar een strategische rol in kunt spelen.”
          </blockquote>
        </section>

        {/* Theorieblok 2 - 5-Krachtenmodel */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            ⚔️ 2. Het 5-Krachtenmodel van Porter
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Dit model helpt je om de concurrentiekrachten binnen een markt te begrijpen. 
            Door deze krachten te analyseren, krijg je inzicht in de uitdagingen en kansen van jouw klant.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Dreiging van nieuwe toetreders</li>
            <li>Macht van leveranciers</li>
            <li>Macht van afnemers</li>
            <li>Dreiging van substituten</li>
            <li>Interne concurrentie</li>
          </ul>
          <p className="text-gray-400">
            Als je begrijpt waar de druk op je klant vandaan komt, kun je beter adviseren en waarde toevoegen.
          </p>
        </section>

        {/* Theorieblok 3 - PESTEL */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🌍 3. PESTEL-analyse
          </h2>
          <p className="text-gray-300 leading-relaxed">
            De PESTEL-analyse helpt om de macro-omgeving van je klant te begrijpen. 
            Deze factoren beïnvloeden hun strategie, risico’s en groeimogelijkheden.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>P</strong> – Politieke factoren (regelgeving, beleid)</li>
            <li><strong>E</strong> – Economische factoren (groei, inflatie, koopkracht)</li>
            <li><strong>S</strong> – Sociale factoren (gedrag, cultuur, demografie)</li>
            <li><strong>T</strong> – Technologische factoren (innovatie, automatisering)</li>
            <li><strong>E</strong> – Ecologische factoren (duurzaamheid, klimaat)</li>
            <li><strong>L</strong> – Juridische factoren (wetgeving, privacy, arbeid)</li>
          </ul>
        </section>

        {/* Theorieblok 4 - Ansoff & BCG */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            📈 4. Ansoff & BCG-matrix
          </h2>
          <p className="text-gray-300 leading-relaxed">
            De Ansoff-matrix toont vier groeistrategieën: 
            marktpenetratie, productontwikkeling, marktontwikkeling en diversificatie. 
            De BCG-matrix helpt bepalen waar je moet investeren, onderhouden of afbouwen.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Stars</strong> – hoge groei, hoge waarde</li>
            <li><strong>Cash Cows</strong> – lage groei, hoge waarde</li>
            <li><strong>Question Marks</strong> – hoge groei, lage waarde</li>
            <li><strong>Dogs</strong> – lage groei, lage waarde</li>
          </ul>
          <p className="text-gray-400">
            Door klanten in deze kwadranten te plaatsen, weet je waar je focus en middelen het meeste rendement opleveren.
          </p>
        </section>

        {/* Theorieblok 5 - Klantsegmentatie */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🧩 5. Klantsegmentatie
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Klantsegmentatie verdeelt je klantenbestand in groepen met vergelijkbare kenmerken, 
            zodat je per segment een passende strategie kunt ontwikkelen.
          </p>
          <p className="text-gray-400">Veelgebruikte segmentatiecriteria:</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Omzet- of winstbijdrage</li>
            <li>Strategisch belang</li>
            <li>Groeipotentie</li>
            <li>Relatieduur of loyaliteit</li>
          </ul>
        </section>

        {/* Quiz */}
        <section className="space-y-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🎯 Kennischeck</h2>
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <p className="text-gray-300">{q.question}</p>
              {q.options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(q.id, index)}
                  className={`block w-full text-left px-4 py-2 rounded-lg border transition ${
                    answers[q.id] === index
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
                ? "✅ Fantastisch – je begrijpt de strategische basis!"
                : "💡 Goed bezig – bekijk de theorie nog even opnieuw."}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Welke analysetool gebruik jij het liefst en waarom?</li>
            <li>Welke externe factor heeft momenteel de grootste invloed op jouw klanten?</li>
            <li>Hoe kun je jouw inzichten vertalen naar betere adviezen voor je klanten?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">
            Gebruik de AI Coach om jouw analyses om te zetten in actie:
          </p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Gebruik mijn SWOT-analyse en geef strategisch advies 
hoe ik de klantrelatie kan verdiepen en omzetgroei kan realiseren.

Welke groeistrategie (volgens Ansoff of BCG) past het beste bij mijn topklant 
en waarom?`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <Link
            to="/academy/accountmanagement/module/1"
            className="px-6 py-2 bg-[#2A2A2A] text-gray-400 rounded-lg font-semibold hover:bg-[#3A3A3A]"
          >
            ← Vorige module
          </Link>
          <Link
            to="/academy/accountmanagement/module/3"
            className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f]"
          >
            Volgende module →
          </Link>
        </footer>
      </div>
    </div>
  );
}
