import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Module1() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Wat is de kern van modern accountmanagement?",
      options: [
        "Zoveel mogelijk verkopen",
        "Begrijpen wat klanten écht beweegt",
        "Targets halen",
        "Kortingen aanbieden",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Wat onderscheidt een strategisch partner van een verkoper?",
      options: [
        "Prijsgericht denken",
        "Alleen resultaten rapporteren",
        "Toekomstgericht adviseren",
        "Hard onderhandelen",
      ],
      correct: 2,
    },
    {
      id: 3,
      question: "Wat is de basis van vertrouwen in klantrelaties?",
      options: [
        "Transparantie en consistentie",
        "Sterke argumenten",
        "Humor en persoonlijkheid",
        "Regelmatig cadeaus sturen",
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
            Module 1 – Fundamenten van Accountmanagement
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Welkom bij module 1! In deze module ontdek je waarom accountmanagement veel meer is dan verkopen. 
            Je leert wat modern accountmanagement inhoudt, hoe vertrouwen en waarde samen duurzame klantrelaties creëren, 
            en hoe jouw zelfinzicht bepaalt of je een verkoper bent… of een strategische partner.
          </p>
        </header>

        {/* Theorieblok 1 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🧠 1. Wat is accountmanagement?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Accountmanagement is het proces van het beheren en ontwikkelen van klantrelaties op een manier die waarde creëert voor beide partijen. 
            Het draait niet om verkopen, maar om begrijpen en adviseren.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Begrijpt de behoeften, doelen en uitdagingen van de klant</li>
            <li>Biedt oplossingen, geen producten</li>
            <li>Versterkt relaties door consistentie en vertrouwen</li>
            <li>Adviseert strategisch hoe de klant beter kan presteren</li>
          </ul>
          <blockquote className="border-l-4 border-[#D6B48E] pl-4 italic text-gray-400">
            “Accountmanagement draait niet om targets halen, maar om doelen delen met de klant.”
          </blockquote>
        </section>

        {/* Theorieblok 2 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🤝 2. Van verkoper naar strategisch partner
          </h2>
          <p className="text-gray-300 leading-relaxed">
            De moderne accountmanager denkt op lange termijn: niet hoe je vandaag verkoopt, maar hoe je morgen samen groeit. 
            Een strategisch partner bouwt invloed op door inzicht en betrouwbaarheid.
          </p>
          <table className="w-full text-left text-gray-300 border border-[#2A2A2A] rounded-lg">
            <thead className="bg-[#1A1A1A] text-[#D6B48E]">
              <tr>
                <th className="p-2">Verkoper</th>
                <th className="p-2">Strategisch Partner</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-t border-[#2A2A2A]">Richt zich op omzet</td>
                <td className="p-2 border-t border-[#2A2A2A]">Richt zich op klantwaarde</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-[#2A2A2A]">Reageert op behoeften</td>
                <td className="p-2 border-t border-[#2A2A2A]">Anticipeert op kansen</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-[#2A2A2A]">Denkt in producten</td>
                <td className="p-2 border-t border-[#2A2A2A]">Denkt in oplossingen</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-[#2A2A2A]">Wil overtuigen</td>
                <td className="p-2 border-t border-[#2A2A2A]">Wil begrijpen</td>
              </tr>
            </tbody>
          </table>

          <p className="text-gray-400">
            Vertrouwen groeit door drie pijlers:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Transparantie – eerlijk over wat wél en niet kan</li>
            <li>Consistentie – doe wat je zegt</li>
            <li>Betrouwbaarheid – kom afspraken na</li>
          </ul>
        </section>

        {/* Theorieblok 3 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">
            🪞 3. Zelfinzicht als fundament
          </h2>
          <p className="text-gray-300 leading-relaxed">
            De beste accountmanagers kennen zichzelf. 
            Ze herkennen wanneer ze luisteren, wanneer ze overtuigen en wanneer hun ego de regie neemt.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Luister ik om te begrijpen of om te reageren?</li>
            <li>Gebruik ik data of aannames in gesprekken?</li>
            <li>Hoe ga ik om met spanning tussen commerciële druk en klantbelang?</li>
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
                ? "✅ Uitstekend werk!"
                : "Blijf oefenen — je zit op de goede weg!"}
            </p>
          )}
        </section>

        {/* Reflectie */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#D6B48E]">🤔 Reflectie</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Wat betekent vertrouwen voor jou in klantrelaties?</li>
            <li>Welke eigenschap maakt jou waardevol als gesprekspartner?</li>
            <li>Hoe ga jij om met spanning tussen commerciële druk en klantbelang?</li>
          </ul>
        </section>

        {/* AI Coach */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#D6B48E]">🤖 AI Coach</h2>
          <p className="text-gray-400">
            Gebruik deze prompts om je aanpak te verbeteren:
          </p>
          <code className="block bg-black/40 text-[#D6B48E] text-sm p-3 rounded-md whitespace-pre-wrap">
{`Analyseer mijn huidige aanpak als accountmanager en geef drie concrete verbeterpunten
om meer strategische waarde te bieden aan klanten.

Welke communicatiegewoonten helpen mij om meer vertrouwen te creëren in gesprekken met key-accounts?`}
          </code>
        </section>

        {/* Navigatie */}
        <footer className="flex justify-between items-center pt-8 border-t border-[#2A2A2A]">
          <span className="text-gray-500 text-sm">✅ Module 1 voltooid</span>
          <Link
            to="/academy/accountmanagement/module/2"
            className="px-6 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
          >
            Volgende module →
          </Link>
        </footer>
      </div>
    </div>
  );
}
