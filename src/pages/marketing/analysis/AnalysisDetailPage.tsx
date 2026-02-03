import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ANALYSIS_RESULTS } from "@/aurelius/config/analysisResultsContent";

export default function AnalysisOverviewPage() {
  const clusters = [
    {
      title: "Strategie & Positionering",
      items: ["strategy", "growth", "market", "swot"],
    },
    {
      title: "Besluitvorming & Macht",
      items: ["culture", "team", "leadership", "change"],
    },
    {
      title: "Structuur & Executie",
      items: ["process", "finance", "ai", "esg"],
    },
    {
      title: "Synthese",
      items: ["synthese"],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Strategische Analyses | Cyntra</title>
        <meta
          name="description"
          content="Cyntra analyseert organisaties langs 13 structurele spanningsvelden die besluitvorming, tempo en leiderschap blokkeren."
        />
      </Helmet>

      <main className="min-h-screen bg-[#0A090A] text-white">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-32">

          {/* HERO */}
          <header className="text-center mb-24">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Eén beslissysteem.<br />
              <span className="text-[#D4AF37]">Dertien onvermijdelijke spanningen.</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Elke organisatie worstelt met dezelfde structurele blokkades.
              Cyntra maakt ze zichtbaar — zonder ruis, zonder politiek,
              zonder optimalisatiepraat.
            </p>
          </header>

          {/* CLUSTERS */}
          <section className="space-y-20">
            {clusters.map((cluster) => (
              <div key={cluster.title}>
                <h2 className="text-2xl font-semibold mb-6">
                  {cluster.title}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {cluster.items.map((key) => {
                    const a = ANALYSIS_RESULTS[key];
                    const Icon = a.icon;

                    return (
                      <div
                        key={a.slug}
                        className="flex items-start gap-5 p-6 bg-black/40 border border-white/10 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                          <Icon size={20} className="text-[#D4AF37]" />
                        </div>

                        <div>
                          <h3 className="font-semibold">{a.title}</h3>
                          <p className="text-sm text-gray-300 mt-1">
                            {a.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="mt-28 text-center">
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-10">
              De volledige analyses — inclusief benoemde blokkades,
              beslisimplicaties en boardroom-klare synthese —
              zijn uitsluitend beschikbaar in de besloten portal.
            </p>

            <Link
              to="/aurelius/login"
              className="inline-flex items-center gap-5 px-16 py-6 rounded-2xl bg-[#D4AF37] text-black font-bold text-xl hover:scale-105 transition"
            >
              Toegang tot Aurelius
              <ArrowRight size={24} />
            </Link>

            <p className="mt-6 text-sm text-gray-500 flex justify-center items-center gap-2">
              <Lock size={16} />
              Alleen voor directie & strategisch niveau
            </p>
          </section>

        </div>
      </main>
    </>
  );
}
