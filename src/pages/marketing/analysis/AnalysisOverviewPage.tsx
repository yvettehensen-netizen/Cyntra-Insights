// src/pages/marketing/analyses/AnalysisOverviewPage.tsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Lock, AlertTriangle } from "lucide-react";

export default function AnalysisOverviewPage() {
  return (
    <>
      <Helmet>
        <title>De Cyntra Analyse — Waar organisaties structureel vastlopen</title>
        <meta
          name="description"
          content="Eén strategisch besliskader dat zichtbaar maakt waarom besluitvorming, leiderschap en groei vastlopen — zelfs wanneer alles goed geregeld lijkt."
        />
        <link rel="canonical" href="https://cyntra-insights.nl/analyses" />
      </Helmet>

      <div className="relative bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
        {/* GLOW */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -top-64 -left-64 w-[900px] h-[900px] bg-[#D4AF37]/10 rounded-full blur-[300px]" />
          <div className="absolute -bottom-64 -right-64 w-[1000px] h-[1000px] bg-[#8B1538]/10 rounded-full blur-[300px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40">

          {/* HERO */}
          <header className="text-center mb-24 lg:mb-28">
            <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-16">
              <Lock size={22} className="text-[#D4AF37]" />
              <span className="text-sm font-bold tracking-widest text-[#D4AF37]">
                BESLOTEN STRATEGISCH BESLISKADER
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-12">
              Niet wat je doet,<br />
              <span className="text-[#D4AF37]">
                maar waarom het vastloopt
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Cyntra maakt zichtbaar waarom organisaties met capabele mensen,
              heldere plannen en goede cijfers tóch vastlopen —
              en waarom die spanning structureel elders ontstaat dan waar men zoekt.
            </p>
          </header>

          {/* VISUEEL ANKER */}
          <section className="mb-32 -mx-6">
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
                alt="Strategische besluitvorming onder spanning"
                className="w-full h-[460px] object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>
          </section>

          {/* HERKENNING */}
          <section className="mb-32">
            <h2 className="text-4xl font-bold text-center mb-20">
              Dit zijn geen incidenten
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Besluitvorming vertraagt",
                  text: "Niet door gebrek aan overleg, maar doordat eigenaarschap diffuus is geworden.",
                },
                {
                  title: "Ziekteverzuim stijgt",
                  text: "Niet door werkdruk, maar door structurele spanning die niet benoemd mag worden.",
                },
                {
                  title: "Groei voelt zwaarder",
                  text: "Meer omzet en mensen leiden tot minder overzicht en voorspelbaarheid.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-black/40 border border-white/10 rounded-3xl p-10"
                >
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* STRUCTUUR */}
          <section className="mb-32 text-center">
            <h2 className="text-4xl font-bold mb-16">
              De onderliggende oorzaak
            </h2>

            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Cyntra analyseert organisaties langs <strong>13 structurele spanningsvelden</strong>.
              Niet als losse thema’s, maar als één samenhangend systeem waarin
              strategie, macht, cultuur, besluitvorming en executie elkaar beïnvloeden.
            </p>

            <div className="mt-16 flex justify-center gap-4 text-gray-400 items-center">
              <AlertTriangle />
              <span>Spanningen bestaan nooit geïsoleerd</span>
            </div>
          </section>

          {/* QUICKSCAN */}
          <section className="mb-32 bg-black/50 border border-[#D4AF37]/40 rounded-3xl p-20 text-center">
            <h2 className="text-4xl font-bold mb-10">
              Wil je weten waar dit bij jou speelt?
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-14">
              De Quickscan confronteert je met structurele realiteit —
              zonder oordeel, zonder rapport,
              maar met directe herkenning.
            </p>

            <Link
              to="/quickscan"
              className="inline-flex items-center gap-6 px-24 py-9 rounded-3xl bg-[#D4AF37] text-black font-bold text-2xl hover:scale-105 transition"
            >
              Start Quickscan
              <ArrowRight size={32} />
            </Link>
          </section>

          {/* AURELIUS CTA */}
          <section className="text-center">
            <p className="text-xl text-gray-400 mb-16 max-w-4xl mx-auto">
              De volledige Cyntra Analyse — inclusief scherpe observaties,
              expliciete spanningen en boardroom-klare conclusies —
              is uitsluitend beschikbaar binnen Aurelius.
            </p>

            <Link
              to="/aurelius/login"
              className="inline-flex items-center gap-7 px-28 py-10 rounded-3xl bg-[#D4AF37] text-black font-bold text-3xl hover:scale-105 transition"
            >
              Zie dit scherp in Aurelius
              <ArrowRight size={36} />
            </Link>

            <p className="mt-12 text-lg text-gray-500 flex justify-center items-center gap-4">
              <Lock size={22} />
              Volledig vertrouwelijk • Board-niveau
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
