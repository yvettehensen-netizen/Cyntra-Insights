import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Lock, Cpu } from "lucide-react";

export default function AIAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>AI & Data Volwassenheid — Cyntra</title>
        <meta
          name="description"
          content="Wanneer AI slechte beslissingen versnelt. Analyse van datakwaliteit, eigenaarschap en beslisimpact — zonder hype."
        />
        <link
          rel="canonical"
          href="https://cyntra-insights.nl/analyses/ai-data"
        />
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -top-64 -left-64 w-[900px] h-[900px] bg-[#D4AF37]/10 rounded-full blur-[300px]" />
          <div className="absolute -bottom-64 -right-64 w-[1000px] h-[1000px] bg-[#8B1538]/10 rounded-full blur-[300px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
          {/* HERO */}
          <header className="text-center mb-24">
            <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 mb-12">
              <Cpu size={28} className="text-[#D4AF37]" />
              <span className="text-sm font-bold tracking-widest text-[#D4AF37]">
                AI & DATA ANALYSE
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-10">
              Wanneer AI slechte beslissingen<br />
              <span className="text-[#D4AF37]">versnelt</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AI lost niets op.<br />
              Het vergroot wat al structureel misgaat in data, eigenaarschap
              en besluitvorming.
            </p>
          </header>

          {/* VISUEEL ANKER – SAFE PLACEHOLDER */}
          <section className="mb-24">
            <div className="h-[380px] rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center text-gray-500">
              Visueel anker — AI / besluitvorming
            </div>
          </section>

          {/* WAT WORDT BLOOTGELEGD */}
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12">
              Wat deze analyse blootlegt
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Data als politiek middel",
                  text: "Data wordt ingezet om besluiten te legitimeren in plaats van te sturen.",
                },
                {
                  title: "AI zonder eigenaarschap",
                  text: "Niemand is eindverantwoordelijk voor uitkomsten.",
                },
                {
                  title: "Automatisering van ruis",
                  text: "AI versnelt complexiteit in plaats van helderheid.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-black/40 border border-white/10 rounded-3xl p-8"
                >
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <p className="text-gray-400 mb-8">
              Deze analyse is alleen beschikbaar binnen de Aurelius-portal.
            </p>

            <Link
              to="/aurelius/login"
              state={{ redirectTo: "/portal/analyse/ai-data" }}
              className="inline-flex items-center gap-6 px-20 py-7 rounded-2xl bg-[#D4AF37] text-black font-bold text-xl hover:scale-105 transition"
            >
              Start AI & Data Analyse
              <ArrowRight size={26} />
            </Link>

            <p className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lock size={16} />
              Geen dataretentie • Volledig vertrouwelijk
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

