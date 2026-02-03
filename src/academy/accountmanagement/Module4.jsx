import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module4() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is klantwaarde in de context van accountmanagement?",
      options: [
        "De winst die een klant oplevert op korte termijn",
        "De totale waarde van de relatie, inclusief vertrouwen en samenwerking",
        "Het bedrag dat een klant jaarlijks uitgeeft",
        "De korting die een klant ontvangt",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Wat is een belangrijk doel van relatiebeheer?",
      options: [
        "Zoveel mogelijk contactmomenten hebben",
        "Een duurzame, wederzijds waardevolle relatie opbouwen",
        "Klanten tevreden houden door alles goed te keuren",
        "De prijs laag houden",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "Wat betekent NPS in klantrelatiebeheer?",
      options: [
        "Netto Prestatie Score",
        "Net Promoter Score",
        "Nieuwe Partner Strategie",
        "Net Profit Statement",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Wat is een belangrijk moment in de klantreis (‘moment of truth’)?",
      options: [
        "Wanneer de klant voor het eerst klaagt",
        "Wanneer de klant contact opneemt met support",
        "Wanneer de klant ervaart of beloofde waarde echt wordt geleverd",
        "Wanneer de factuur verstuurd wordt",
      ],
      correct: 2,
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
            Module 4 – Klantwaarde & Loyaliteit
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Relatiebeheer is de kunst van lange termijn denken. 
            In deze module leer je hoe je klantwaarde opbouwt, behoudt en versterkt — 
            niet alleen in omzet, maar ook in vertrouwen, betrokkenheid en loyaliteit.
          </p>
        </header>

        {/* Theorieblok 1 - Klantwaarde */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            💎 1. Wat is klantwaarde?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Klantwaarde is de balans tussen wat een klant ontvangt (waarde, service, resultaat)
            en wat hij daarvoor betaalt (tijd, geld, energie). 
            Een goede accountmanager begrijpt dat waarde niet alleen financieel is — 
            het zit ook in vertrouwen, samenwerking en het gevoel van partnerschap.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Functionele waarde:</strong> de oplossing werkt goed</li>
            <li><strong>Relationele waarde:</strong> samenwerking en vertrouwen</li>
            <li><strong>Strategische waarde:</strong> helpt de klant zijn doelen bereiken</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Waarde ontstaat niet in wat je levert, maar in wat de klant ervaart.”
          </blockquote>
        </section>

        {/* Theorieblok 2 - Loyaliteit */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🔁 2. De kracht van loyaliteit
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Klantloyaliteit gaat verder dan tevredenheid. 
            Een loyale klant vertrouwt op jou, beveelt je aan en groeit met je mee. 
            Loyaliteit bouw je niet met beloftes, maar met consistent gedrag.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Vertrouwen komt vóór tevredenheid</li>
            <li>Consistentie creëert voorspelbaarheid en rust</li>
            <li>Waarde leveren versterkt loyaliteit vanzelf</li>
          </ul>
          <p className="text-gray-400">
            Gebruik tools zoals de <strong>Net Promoter Score (NPS)</strong> om loyaliteit te meten:
          </p>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Zou je ons aanbevelen aan een collega of vriend?”  
          </blockquote>
        </section>

        {/* Theorieblok 3 - Klantreis */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🚀 3. De klantreis (Customer Journey)
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Elke klant doorloopt een reis: van eerste contact tot trouwe ambassadeur. 
            Als accountmanager moet je weten op welke momenten jij écht impact maakt.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li><strong>Bewustwording:</strong> klant leert jouw organisatie kennen</li>
            <li><strong>Overweging:</strong> klant vergelijkt opties</li>
            <li><strong>Aankoop:</strong> klant kiest en ervaart jouw belofte</li>
            <li><strong>Gebruik:</strong> klant ervaart waarde of teleurstelling</li>
            <li><strong>Ambassadeurschap:</strong> klant beveelt jou actief aan</li>
          </ul>
          <p className="text-gray-400">
            Elke fase biedt een kans om klantwaarde te versterken. 
            Focus op de <em>“moments of truth”</em> – waar verwachtingen worden getest.
          </p>
        </section>

        {/* Theorieblok 4 - Waarde verhogen */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            📈 4. Hoe verhoog je klantwaarde?
          </h2>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Luister naar feedback en handel ernaar</li>
            <li>Wees proactief in verbeteringen en innovatie</li>
            <li>Maak resultaten zichtbaar met data en cases</li>
            <li>Erken en waardeer klanten oprecht</li>
          </ul>
          <p className="text-gray-400">
            Waarde verhogen begint met oprechte interesse — niet met een nieuw product.
          </p>
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
                ? "✅ Fantastisch – je begrijpt klantwaarde écht!"
                : "💡 Goed bezig – lees nog eens terug waar waarde ontstaat."}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Wat maakt volgens jou een klant écht loyaal?</li>
            <li>Hoe toon jij waardering aan je klanten?</li>
            <li>Welke momenten in de klantreis zijn jouw sterkste impactmomenten?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">
            Gebruik de AI Coach om je relatiebeheer te versterken:
          </p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Analyseer mijn top 3 klanten en geef suggesties 
om de klantwaarde per klant te verhogen.

Welke contactmomenten in mijn klantreis 
bied ik nog te weinig waarde? Hoe kan ik dat verbeteren?`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <Link
            to="/academy/accountmanagement/module/3"
            className="px-6 py-2 bg-[#2A2A2A] text-gray-400 rounded-lg font-semibold hover:bg-[#3A3A3A]"
          >
            ← Vorige module
          </Link>
          <Link
            to="/academy/accountmanagement/module/5"
            className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f]"
          >
            Volgende module →
          </Link>
        </footer>
      </div>
    </div>
  );
}
