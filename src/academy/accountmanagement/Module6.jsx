import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module6() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is de essentie van persoonlijk leiderschap?",
      options: [
        "Anderen vertellen wat ze moeten doen",
        "Eigenaarschap nemen over je gedrag, keuzes en resultaten",
        "De controle houden over alle situaties",
        "Het team aansturen met strikte regels",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Wat betekent invloed in accountmanagement?",
      options: [
        "Mensen overtuigen om jouw ideeën te volgen",
        "Vertrouwen en respect opbouwen waardoor anderen je visie volgen",
        "Altijd gelijk willen krijgen",
        "Beslissingen doordrukken via hiërarchie",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "Wat is de beste manier om een team of klant te inspireren?",
      options: [
        "Door veel cijfers te delen",
        "Door authentiek voorbeeldgedrag te tonen",
        "Door assertief te blijven in elk gesprek",
        "Door elk risico te vermijden",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Wat is een kenmerk van duurzaam groeien als accountmanager?",
      options: [
        "Altijd streven naar meer klanten, ongeacht kwaliteit",
        "Leren, reflecteren en relaties verdiepen",
        "Focus op korte termijn omzet",
        "Afhankelijk blijven van externe omstandigheden",
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
            Module 6 – Leiderschap & Groei
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            In deze afsluitende module breng je alles samen: strategie, relaties, data en zelfinzicht.  
            Je leert hoe persoonlijk leiderschap en invloed zorgen voor duurzame groei — bij klanten én bij jezelf.
          </p>
        </header>

        {/* Theorieblok 1 – Persoonlijk leiderschap */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">👑 1. Persoonlijk leiderschap</h2>
          <p className="text-gray-300 leading-relaxed">
            Persoonlijk leiderschap betekent dat je verantwoordelijkheid neemt voor je gedrag en resultaten.  
            Je reageert niet op omstandigheden — je kiest bewust hoe je handelt, denkt en communiceert.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Eigenaarschap nemen over successen én fouten</li>
            <li>Actief reflecteren op gedrag en keuzes</li>
            <li>Doelen koppelen aan persoonlijke waarden</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Leiderschap begint niet bij anderen, maar bij jezelf.”
          </blockquote>
        </section>

        {/* Theorieblok 2 – Invloed & Communicatie */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🧭 2. Invloed & Communicatie</h2>
          <p className="text-gray-300 leading-relaxed">
            Invloed gaat over vertrouwen, niet macht.  
            Als accountmanager beïnvloed je klanten, teams en beslissers door consistentie, empathie en overtuiging.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Wees betrouwbaar – zeg wat je doet, doe wat je zegt</li>
            <li>Luister met intentie, niet met agenda</li>
            <li>Stel vragen die richting geven in plaats van meningen</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Invloed is niet overtuigen, maar inspireren.”
          </blockquote>
        </section>

        {/* Theorieblok 3 – Strategische groei */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🚀 3. Strategische groei</h2>
          <p className="text-gray-300 leading-relaxed">
            Duurzame groei in accountmanagement draait niet om meer deals, maar om diepere relaties en betere keuzes.  
            Groei ontstaat als je continu leert, meet en verbetert.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Ontwikkel klanten én jezelf tegelijkertijd</li>
            <li>Gebruik data en feedback als leerinstrument</li>
            <li>Stel groeidoelen in termen van impact, niet alleen omzet</li>
          </ul>
          <p className="text-gray-400">
            De beste accountmanagers groeien niet door harder te werken, maar door slimmer en bewuster te werken.
          </p>
        </section>

        {/* Theorieblok 4 – Mentale veerkracht */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🧠 4. Mentale veerkracht</h2>
          <p className="text-gray-300 leading-relaxed">
            Leiderschap vraagt veerkracht: het vermogen om met tegenslagen om te gaan zonder energie te verliezen.  
            Veerkrachtige accountmanagers herstellen snel, leren snel en blijven kalm onder druk.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Zie feedback als brandstof, niet als kritiek</li>
            <li>Beheer je energie, niet alleen je tijd</li>
            <li>Gebruik reflectie om richting te houden</li>
          </ul>
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
                ? "✅ Uitstekend – je straalt leiderschap en strategisch inzicht uit!"
                : "💡 Mooi werk – lees terug hoe leiderschap in de praktijk zichtbaar wordt."}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Wat betekent leiderschap voor jou in je rol als accountmanager?</li>
            <li>Hoe kun je meer invloed uitoefenen zonder druk te zetten?</li>
            <li>Welke gewoonte helpt jou om veerkrachtig te blijven?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">Gebruik de AI Coach om jouw leiderschapsgroei te versterken:</p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Analyseer mijn leiderschapsstijl in klantrelaties 
en geef suggesties om meer invloed en rust uit te stralen.

Welke gewoonten of routines helpen mij om duurzaam te groeien 
zonder energie te verliezen?`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <Link
            to="/academy/accountmanagement/module/5"
            className="px-6 py-2 bg-[#2A2A2A] text-gray-400 rounded-lg font-semibold hover:bg-[#3A3A3A]"
          >
            ← Vorige module
          </Link>
          <span className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold">
            🎓 Cursus voltooid
          </span>
        </footer>
      </div>
    </div>
  );
}
