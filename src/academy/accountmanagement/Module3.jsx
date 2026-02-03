import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module3() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is de kern van effectief onderhandelen als accountmanager?",
      options: [
        "De klant overtuigen met argumenten",
        "Een win-win creëren waarin waarde behouden blijft",
        "Zoveel mogelijk marge behouden, ongeacht de relatie",
        "De klant laten praten tot hij toegeeft",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Wat is een belangrijk principe van actief luisteren?",
      options: [
        "Snel reageren om de ander gerust te stellen",
        "Luisteren om te begrijpen, niet om te antwoorden",
        "Altijd samenvatten wat jij denkt dat ze bedoelen",
        "Direct oplossingen aandragen",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "Wat is een belangrijk doel van een accountplan?",
      options: [
        "Interne administratie bijhouden",
        "Een overzicht geven van klantdoelen, strategie en acties",
        "Een lijst van verkochte producten bijhouden",
        "De winst van de klant berekenen",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Welke vaardigheid is cruciaal in strategische communicatie?",
      options: [
        "Overtuigingskracht",
        "Empathisch luisteren en analyseren",
        "Altijd het laatste woord hebben",
        "Snel beslissingen nemen",
      ],
      correct: 1,
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
            Module 3 – Geavanceerde Technieken & Practicum
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            In deze module leer je de geavanceerde vaardigheden die een goede accountmanager onderscheiden van een uitstekende. 
            Je oefent met onderhandelen, strategische communicatie en het opstellen van een effectief accountplan. 
            Hier breng je alles samen wat je hebt geleerd.
          </p>
        </header>

        {/* Theorieblok 1 - Onderhandelen */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            💬 1. Onderhandelen vanuit waarde
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Effectieve accountmanagers onderhandelen niet om te winnen, maar om 
            gezamenlijke waarde te behouden. Succesvolle onderhandelingen draaien 
            om luisteren, begrijpen en sturen op wederzijds belang.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Focus op belangen, niet op posities</li>
            <li>Gebruik stilte als kracht – laat de klant nadenken</li>
            <li>Vat samen in plaats van te verdedigen</li>
            <li>Vraag door tot je de echte behoefte begrijpt</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “De sterkste onderhandelaars winnen geen deals — ze bouwen relaties.”
          </blockquote>
        </section>

        {/* Theorieblok 2 - Communicatie */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🧠 2. Communicatie & Invloed
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Communicatie is meer dan praten. 
            Strategische communicatie betekent luisteren op drie niveaus:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Niveau 1:</strong> Wat hoor ik letterlijk?</li>
            <li><strong>Niveau 2:</strong> Wat bedoelt de ander écht?</li>
            <li><strong>Niveau 3:</strong> Wat zegt dit over hun situatie of behoefte?</li>
          </ul>
          <p className="text-gray-400">
            Door dit toe te passen, word je een gesprekspartner die vertrouwen wekt én richting geeft.
          </p>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Luisteren is invloed uitoefenen zonder te duwen.”
          </blockquote>
        </section>

        {/* Theorieblok 3 - Accountplan */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            📋 3. Het Strategisch Accountplan
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Een accountplan is jouw strategische kompas voor het managen van key-accounts. 
            Het brengt klantdoelen, kansen, risico’s en acties overzichtelijk samen.
          </p>
          <h3 className="text-xl font-semibold text-[#D6B48E]">Essentiële onderdelen:</h3>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Klantprofiel – kerncijfers, strategie en doelen</li>
            <li>SWOT van de klantrelatie</li>
            <li>Strategische doelstellingen</li>
            <li>Actieplan en KPI’s</li>
          </ul>
          <p className="text-gray-400">
            Een goed accountplan is geen document, maar een levend instrument voor samenwerking.
          </p>
        </section>

        {/* Theorieblok 4 - Praktijkcase */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🧩 4. Praktijkcase: “Te duur”
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Een klant zegt: “Jullie zijn te duur.” 
            Hoe reageer je als strategisch partner?
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Reageer niet defensief</strong> – vraag door: “In vergelijking waarmee?”</li>
            <li><strong>Verplaats je in hun perspectief</strong> – wat is hun échte zorg?</li>
            <li><strong>Herformuleer waarde</strong> – benadruk resultaten, niet prijzen</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Wie over prijs praat, heeft te weinig over waarde gepraat.”
          </blockquote>
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
                ? "✅ Uitstekend – je beheerst de kern van professioneel accountmanagement!"
                : "💡 Goed gedaan – herlees de theorie om nog scherper te worden."}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Wat was jouw laatste onderhandeling? Hoe verliep die echt?</li>
            <li>Welke communicatietechniek pas jij het meest toe in klantgesprekken?</li>
            <li>Wat zou jij toevoegen aan jouw accountplan om het krachtiger te maken?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">
            Gebruik deze prompts om je vaardigheden verder te ontwikkelen:
          </p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Evalueer mijn onderhandelingsstijl in klantgesprekken 
en geef drie verbeterpunten om meer waarde te behouden.

Beoordeel mijn accountplan en geef suggesties 
om het plan strategischer en klantgerichter te maken.`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <Link
            to="/academy/accountmanagement/module/2"
            className="px-6 py-2 bg-[#2A2A2A] text-gray-400 rounded-lg font-semibold hover:bg-[#3A3A3A]"
          >
            ← Vorige module
          </Link>
          <span className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold">
            ✅ Cursus voltooid
          </span>
        </footer>
      </div>
    </div>
  );
}
