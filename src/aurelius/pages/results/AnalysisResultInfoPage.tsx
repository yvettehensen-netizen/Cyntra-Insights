// src/aurelius/pages/results/AnalysisResultInfoPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import AureliusNavbar from "../../components/AureliusNavbar";
import { getAnalysisBySlug } from "../../config/analysisResultsSelectors";

export default function AnalysisResultInfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const content = slug ? getAnalysisBySlug(slug) : null;

  if (!content || !slug) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Analyse niet gevonden.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A090A] to-black text-white">
      <AureliusNavbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-40 space-y-20">
        <section>
          <h1 className="text-5xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl text-[#D4AF37]">{content.subtitle}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Wat Aurelius hier blootlegt
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            {content.exposes}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Typische pijnpunten
          </h2>
          <ul className="space-y-4 text-lg text-gray-300">
            {content.painPoints.map((p, i) => (
              <li key={i}>— {p}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Wat er gebeurt als je dit negeert
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            {content.consequence}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Wat je krijgt na analyse
          </h2>
          <ul className="space-y-4 text-lg text-gray-300">
            {content.outcome.map((o, i) => (
              <li key={i}>— {o}</li>
            ))}
          </ul>
        </section>

        <section className="pt-10 border-t border-white/10">
          <button
            onClick={() => navigate(`/portal/analyse/${slug}`)}
            className="px-10 py-5 bg-[#D4AF37] text-black text-lg font-bold rounded-2xl hover:scale-105 transition"
          >
            Start deze analyse
          </button>
        </section>
      </main>
    </div>
  );
}
