// src/pages/marketing/quickscan/FreeStrategicQuickscan.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Question {
  id: number;
  statement: string;
  context: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    statement: "Besluiten worden genomen op basis van helder eigenaarschap, niet op basis van consensus.",
    context: "Wanneer niemand echt eigenaar is, ontstaat vertraging die zichzelf versterkt.",
  },
  {
    id: 2,
    statement: "Onze strategie is expliciet — iedereen weet wat we níét meer doen.",
    context: "Onduidelijke grenzen zijn de grootste oorzaak van ruis en politieke discussies.",
  },
  {
    id: 3,
    statement: "Spanningen in het team worden benoemd voordat ze zich uiten in verzuim of verloop.",
    context: "Organisaties voelen problemen altijd eerder dan ze ze durven benoemen.",
  },
  {
    id: 4,
    statement: "Groei leidt bij ons tot meer rust en voorspelbaarheid — niet tot complexiteit.",
    context: "Als systemen en besluitvorming niet meegroeien, wordt groei destructief.",
  },
  {
    id: 5,
    statement: "Wij kunnen vandaag exact uitleggen waarom dingen lopen zoals ze lopen.",
    context: "Zonder structureel inzicht blijft elke verbetering symptoombestrijding.",
  },
];

type Answer = "yes" | "partial" | "no";

export default function FreeStrategicQuickscan() {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showResult, setShowResult] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const negativeCount = Object.values(answers).filter(a => a === "no" || a === "partial").length;

  const verdict =
    negativeCount >= 4 ? "structureel"
    : negativeCount >= 2 ? "instabiel"
    : "schijnbaar stabiel";

  const verdictConfig = {
    structureel: {
      icon: AlertTriangle,
      color: "text-red-400",
      title: "Structureel kwetsbaar",
      teaser: "De spanningen die je voelt zijn niet incidenteel — ze zijn ingebed in eigenaarschap, richting en besluitvorming.",
      upsell: "De volledige analyse onthult exact waar de blokkades zitten en geeft een concreet 90-dagen actieplan om ze op te lossen.",
    },
    instabiel: {
      icon: AlertTriangle,
      color: "text-amber-400",
      title: "Kantelpunt",
      teaser: "Op papier werkt veel, maar onder druk ontstaan vertraging en ruis. Dit is een klassiek kantelpunt.",
      upsell: "De volledige analyse laat zien welke keuzes nu het verschil maken tussen stabiliteit en verdere erosie.",
    },
    "schijnbaar stabiel": {
      icon: CheckCircle2,
      color: "text-emerald-400",
      title: "Voorlopig stabiel",
      teaser: "De structuur houdt stand — zolang omstandigheden meewerken. De vraag is niet óf, maar wanneer dit getest wordt.",
      upsell: "De volledige analyse toont de verborgen risico’s en geeft een proactief 90-dagen plan om toekomstige druk op te vangen.",
    },
  }[verdict];

  const Icon = verdictConfig?.icon ?? AlertTriangle;

  return (
    <>
      <Helmet>
        <title>Gratis Strategische Quickscan | Cyntra</title>
        <meta
          name="description"
          content="Ontdek in 2 minuten of jouw organisatie structureel kwetsbaar is. Gratis, anoniem en zonder registratie."
        />
      </Helmet>

      <div className="relative bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-[-200px] left-[-200px] w-[900px] h-[900px] bg-[#D4AF37]/10 rounded-full blur-[300px] animate-pulse" />
          <div className="absolute bottom-[-300px] right-[-300px] w-[1000px] h-[1000px] bg-[#8B1538]/10 rounded-full blur-[300px] animate-pulse animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-40">
          {!showResult ? (
            <>
              {/* Intro – Ultra-kort & uitnodigend */}
              <header className="text-center mb-20">
                <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 mb-12 shadow-2xl">
                  <Lock size={28} className="text-[#D4AF37]" />
                  <span className="text-base font-bold text-[#D4AF37] tracking-widest">
                    GRATIS QUICKSCAN
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-12">
                  Ontdek in 2 minuten<br />
                  <span className="text-[#D4AF37]">waar jouw organisatie écht staat</span>
                </h1>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Geen score. Geen registratie.<br />
                  Alleen een eerlijk oordeel over structurele kwetsbaarheid.
                </p>
              </header>

              {/* Questions – Super compact */}
              <div className="space-y-12">
                {QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl hover:border-[#D4AF37]/50 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h2 className="text-xl lg:text-2xl font-bold mb-4 relative z-10">
                      {q.statement}
                    </h2>

                    <p className="text-base text-gray-400 mb-8 relative z-10">
                      {q.context}
                    </p>

                    <div className="flex flex-wrap gap-6 justify-center relative z-10">
                      {[
                        { key: "yes", label: "Ja", color: "bg-emerald-950/60 border-emerald-500/60 text-emerald-300" },
                        { key: "partial", label: "Gedeeltelijk", color: "bg-amber-950/60 border-amber-500/60 text-amber-300" },
                        { key: "no", label: "Nee", color: "bg-red-950/60 border-red-500/60 text-red-300" },
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setAnswers({ ...answers, [q.id]: option.key as Answer })}
                          className={`px-10 py-5 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                            answers[q.id] === option.key
                              ? `${option.color} shadow-lg shadow-current/40 scale-110`
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA – Progressief & motiverend */}
              <div className="mt-20 text-center">
                <button
                  disabled={answeredCount < QUESTIONS.length}
                  onClick={() => setShowResult(true)}
                  className="group relative inline-flex items-center gap-7 px-28 py-10 rounded-3xl bg-[#D4AF37] text-black font-bold text-2xl overflow-hidden shadow-3xl hover:shadow-[#D4AF37]/70 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-500"
                >
                  <span className="relative z-10 flex items-center gap-6">
                    {answeredCount === QUESTIONS.length ? "Bekijk jouw oordeel" : `Nog ${QUESTIONS.length - answeredCount} te gaan`}
                    {answeredCount === QUESTIONS.length && <ArrowRight size={36} className="group-hover:translate-x-5 transition-transform duration-500" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Resultaat – Teaser + sterke upsell */}
              <header className="text-center mb-32">
                <Icon size={80} className={`mx-auto mb-12 ${verdictConfig.color}`} />

                <h1 className="text-5xl lg:text-6xl font-bold mb-12">
                  {verdictConfig.title}
                </h1>

                <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-20">
                  {verdictConfig.teaser}
                </p>

                {/* Upsell blok – Luxe & overtuigend */}
                <div className="bg-black/60 backdrop-blur-xl border-2 border-[#D4AF37]/60 rounded-3xl p-20 max-w-4xl mx-auto shadow-3xl">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-[#D4AF37]">
                    Dit is slechts het begin
                  </h2>

                  <p className="text-xl text-gray-300 leading-relaxed mb-12">
                    {verdictConfig.upsell}
                  </p>

                  <p className="text-lg text-gray-400 mb-12">
                    De volledige Aurelius-analyse geeft:
                  </p>

                  <ul className="space-y-6 text-left text-xl text-gray-200 max-w-3xl mx-auto mb-20">
                    <li>• Exacte locatie van de blokkades</li>
                    <li>• Prioriteiten op board-niveau</li>
                    <li>• Concreet 90-dagen actieplan</li>
                    <li>• Geen advies — alleen onverbloemde waarheid</li>
                  </ul>

                  <Link
                    to="/aurelius/login"
                    className="group relative inline-flex items-center gap-8 px-32 py-12 rounded-3xl bg-[#D4AF37] text-black font-bold text-3xl overflow-hidden shadow-3xl hover:shadow-[#D4AF37]/80 hover:scale-105 transition-all duration-500"
                  >
                    <span className="relative z-10 flex items-center gap-7">
                      Unlock de volledige analyse
                      <ArrowRight size={40} className="group-hover:translate-x-6 transition-transform duration-500" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </div>

                <p className="mt-20 text-lg text-gray-500 flex items-center justify-center gap-5">
                  <Lock size={24} />
                  Volledig vertrouwelijk • Geen dataretentie • Boardroom-klaar
                </p>
              </header>
            </>
          )}
        </div>
      </div>
    </>
  );
}