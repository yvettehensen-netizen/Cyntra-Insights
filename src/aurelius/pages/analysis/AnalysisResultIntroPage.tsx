import { useParams, useNavigate } from "react-router-dom";

import AureliusNavbar from "../../components/AureliusNavbar";
import { ANALYSIS_RESULTS } from "../../config/analysisResultsContent";

import { ArrowRight, Lock, AlertTriangle } from "lucide-react";

/* =========================
   TYPES
========================= */

type AnalysisSlug = Extract<keyof typeof ANALYSIS_RESULTS, string>;

function isValidSlug(slug: string | undefined): slug is AnalysisSlug {
  return !!slug && slug in ANALYSIS_RESULTS;
}

/* =========================
   PAGE
========================= */

export default function AnalysisResultIntroPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!isValidSlug(slug)) {
    return (
      <div className="min-h-screen bg-[#0A090A] text-white flex items-center justify-center text-2xl">
        Analyse niet gevonden.
      </div>
    );
  }

  const content = ANALYSIS_RESULTS[slug];
  const Icon = content.icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-[#D4AF37]/10 rounded-full blur-[300px]" />
        <div className="absolute -bottom-1/3 -right-1/4 w-4/5 h-4/5 bg-[#8B1538]/10 rounded-full blur-[300px]" />
      </div>

      <AureliusNavbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-36 space-y-32">
        {/* ================= HERO ================= */}
        <section className="text-center space-y-12">
          <div className="inline-flex items-center gap-5 px-10 py-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 shadow-xl">
            <Icon size={44} className="text-[#D4AF37]" />
            <span className="text-xl font-bold text-[#D4AF37] tracking-widest uppercase">
              Analyse-intro
            </span>
          </div>

          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
            {content.title}
          </h1>

          <p className="text-2xl lg:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </section>

        {/* ================= EXPOSURE ================= */}
        <section className="bg-black/60 backdrop-blur-xl border border-[#D4AF37]/40 rounded-3xl p-20 shadow-2xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-12">
            Wat deze analyse blootlegt
          </h2>
          <p className="text-xl lg:text-2xl text-gray-200 max-w-5xl mx-auto leading-relaxed">
            {content.exposes}
          </p>
        </section>

        {/* ================= PAIN ================= */}
        <section>
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Typische pijnpunten
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {content.painPoints.map((pain: string, i: number) => (
              <div
                key={i}
                className="bg-black/45 border border-white/10 rounded-3xl p-10 shadow-xl hover:border-[#D4AF37]/50 transition"
              >
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                  — {pain}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CONSEQUENCE ================= */}
        <section className="bg-red-950/50 border border-red-600/50 rounded-3xl p-20 text-center shadow-2xl">
          <AlertTriangle size={72} className="text-red-400 mx-auto mb-12" />
          <h2 className="text-4xl lg:text-5xl font-bold text-red-400 mb-12">
            Wat gebeurt er als je dit negeert
          </h2>
          <p className="text-2xl lg:text-3xl text-gray-100 max-w-5xl mx-auto leading-relaxed">
            {content.consequence}
          </p>
        </section>

        {/* ================= OUTCOME ================= */}
        <section>
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Wat je krijgt na deze analyse
          </h2>

          <div className="space-y-10 max-w-5xl mx-auto">
            {content.outcome.map((item: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-8 p-10 bg-black/45 border border-white/10 rounded-3xl shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] text-black font-bold text-2xl flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed pt-1">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="text-center pt-12">
          <button
            onClick={() => navigate(`/portal/analyse/${slug}`)}
            className="inline-flex items-center gap-8 px-32 py-12 rounded-3xl bg-[#D4AF37] text-black font-bold text-4xl shadow-2xl hover:scale-105 transition"
          >
            Start deze analyse
            <ArrowRight size={44} />
          </button>

          <p className="mt-12 text-xl text-gray-500 flex items-center justify-center gap-4">
            <Lock size={28} />
            Volledig vertrouwelijk • Alleen zinvol bij radicale eerlijkheid
          </p>
        </section>

        <footer className="pt-24 text-center text-gray-600 border-t border-white/10">
          Aurelius Engine™ • Geen dataretentie • Boardroom-klaar inzicht
        </footer>
      </main>
    </div>
  );
}
