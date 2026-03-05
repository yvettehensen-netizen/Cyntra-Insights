import { useParams, useNavigate } from "react-router-dom";
import AureliusNavbar from "@/aurelius/components/AureliusNavbar";
import { useAureliusResult } from "@/aurelius/hooks/useAureliusResult";
import { AlertTriangle, Target, Lightbulb } from "lucide-react";

export default function AureliusResultPage() {
  const params = useParams();
  const resultId = params.id;
  const navigate = useNavigate();

  const { data: result, loading, error } = useAureliusResult(resultId);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center animate-pulse">
            <Lightbulb size={40} className="text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-semibold">
            Aurelius formuleert de waarheid…
          </p>
        </div>
      </div>
    );
  }

  /* ---------- ERROR / NOT FOUND ---------- */
  if (!result || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <AlertTriangle size={64} className="mx-auto mb-8 text-red-500" />
          <h1 className="text-4xl font-bold mb-6">
            Resultaat niet beschikbaar
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            {error ?? "Dit rapport kon niet worden geladen."}
          </p>
          <button
            onClick={() => navigate("/portal/analyses")}
            className="px-10 py-5 bg-[#D4AF37] text-black font-bold rounded-2xl hover:scale-105 transition-transform"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  /* ---------- RESULT ---------- */
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0A090A] via-[#0F0B10] to-[#0A090A] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute -top-64 -left-64 w-[900px] h-[900px] bg-[#D4AF37]/10 rounded-full blur-[300px] animate-pulse" />
        <div className="absolute -bottom-64 -right-64 w-[1000px] h-[1000px] bg-[#8B1538]/10 rounded-full blur-[300px] animate-pulse" />
      </div>

      <AureliusNavbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 lg:pt-32 pb-40">
        {/* EXECUTIVE TRUTH */}
        <section className="text-center mb-32">
          <div className="inline-flex items-center gap-5 px-10 py-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 mb-16 shadow-2xl">
            <Target size={32} className="text-[#D4AF37]" />
            <span className="text-lg font-bold text-[#D4AF37] tracking-widest">
              Executive Truth
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight max-w-[65ch] mx-auto break-words [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            <span className="text-[#D4AF37] [text-shadow:_0_0_60px_rgba(212,175,55,0.8)] drop-shadow-2xl">
              {result.executive_truth}
            </span>
          </h1>
        </section>

        {/* STRATEGISCHE SPANNINGEN */}
        <section className="mb-36">
          <h2 className="text-5xl font-bold text-center mb-20">
            Onopgeloste strategische spanningen
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {result.tensions.map((tension, i) => (
              <div
                key={i}
                className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl hover:border-[#D4AF37]/50 hover:shadow-[#D4AF37]/30 transition-all duration-700 hover:-translate-y-4"
              >
                <p className="text-2xl lg:text-3xl font-bold text-[#D4AF37] break-words max-w-[65ch] leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
                  {tension}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ONONTKOOMBARE KEUZES */}
        <section className="mb-36">
          <h2 className="text-5xl font-bold text-center mb-20">
            Onontkoombare keuzes
          </h2>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div className="bg-black/50 backdrop-blur-xl border-2 border-red-600/50 rounded-3xl p-16 shadow-2xl">
              <h3 className="text-3xl font-bold text-red-400 mb-10 flex items-center justify-center gap-5">
                <AlertTriangle size={40} />
                Stoppen met
              </h3>
              <ul className="space-y-6 text-xl lg:text-2xl text-gray-200">
                {result.forced_choices.stop.map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-4 break-words max-w-[65ch] mx-auto leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-xl border-2 border-[#D4AF37]/60 rounded-3xl p-16 shadow-2xl">
              <h3 className="text-3xl font-bold text-[#D4AF37] mb-10 flex items-center justify-center gap-5">
                <Target size={40} />
                Kiezen voor
              </h3>
              <ul className="space-y-6 text-xl lg:text-2xl text-gray-200">
                {result.forced_choices.choose.map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-4 break-words max-w-[65ch] mx-auto leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
                    <div className="w-4 h-4 rounded-full bg-[#D4AF37]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl lg:text-3xl text-red-400 italic leading-relaxed max-w-[65ch] mx-auto break-words [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
              Kosten van niets doen:
              <br />
              <span className="text-3xl font-bold">
                {result.forced_choices.cost_of_inaction}
              </span>
            </p>
          </div>
        </section>

        {/* RISICO */}
        <section className="mb-36 text-center">
          <h2 className="text-5xl font-bold mb-12 flex items-center justify-center gap-6">
            <AlertTriangle size={48} className="text-red-500" />
            Risico bij niet-handelen
          </h2>
          <p className="text-2xl lg:text-3xl text-gray-200 max-w-[65ch] mx-auto leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
            {result.risk_of_inaction}
          </p>
        </section>

        {/* BOARDROOM SUMMARY */}
        <section className="relative bg-black/60 backdrop-blur-2xl border-2 border-[#D4AF37]/50 rounded-3xl p-24 shadow-3xl overflow-hidden">
          <div className="relative z-10 text-center">
            <h2 className="text-5xl lg:text-6xl font-bold mb-20 text-[#D4AF37]">
              Boardroom Summary
            </h2>

            <ul className="space-y-10 text-xl lg:text-2xl text-gray-200 max-w-[65ch] mx-auto">
              {result.boardroom_summary.map((point, i) => (
                <li key={i} className="flex items-center justify-center gap-6 break-words leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] [hyphens:auto]">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="mt-32 text-center text-base text-gray-500">
          Aurelius Engine™ • Volledig vertrouwelijk • Alleen voor directie & board
        </footer>
      </div>
    </div>
  );
}
