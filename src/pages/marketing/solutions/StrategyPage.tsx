import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import {
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="text-center container mx-auto px-6 max-w-4xl mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Strategische Analyse
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed">
            Cyntra helpt leiders scherpe strategische keuzes maken met behulp van
            AI-gedreven analyse. Geen dashboards om te bekijken, maar inzichten
            die besluitvorming afdwingen.
          </p>
        </section>

        {/* AURELIUS CONTEXT BLOCK */}
        <section className="container mx-auto px-6 max-w-3xl mb-20">
          <div className="border border-white/10 rounded-2xl p-6 bg-black/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-semibold text-white">
                Aurelius — Besloten AI-omgeving
              </h2>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Aurelius is geen marketingtool en geen rapportgenerator.
              Het confronteert leiders met de kloof tussen intentie en realiteit,
              en vertaalt analyse direct naar strategische implicaties.
              <br />
              <br />
              Toegang is bedoeld voor directie, MT en adviseurs met
              besluitverantwoordelijkheid.
            </p>
          </div>
        </section>

        {/* CONTENT BLOCKS */}
        <section className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-10 mb-24">
          {[
            {
              icon: Target,
              title: "SWOT & Positionering",
              desc: "Heldere analyse van sterktes, zwaktes, kansen en bedreigingen — geplaatst in strategische context.",
            },
            {
              icon: TrendingUp,
              title: "Markt- & Concurrentiedruk",
              desc: "Inzicht in marktpositie, differentiatie en waar strategische spanning ontstaat.",
            },
            {
              icon: BarChart3,
              title: "Groeipad & Focus",
              desc: "Welke strategische richtingen zijn logisch — en welke zijn risicovol of afleidend.",
            },
            {
              icon: FileText,
              title: "Besluitimplicaties",
              desc: "Geen conclusies zonder consequenties. Elk inzicht leidt tot duidelijke beslispunten.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[#D4AF37]/40 transition-all duration-300"
            >
              <item.icon className="w-10 h-10 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-sm text-gray-400 max-w-xl mx-auto mb-6">
            Door verder te gaan krijg je toegang tot een besloten Aurelius-omgeving.
            Inzichten zijn confronterend en bedoeld om richting te geven aan
            strategische besluiten.
          </p>

          <a
            href="/aurelius/insights/1"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] hover:from-[#6d1028] hover:to-[#8B1538] text-white rounded-xl font-semibold transition-all"
          >
            Toegang tot Aurelius
            <ArrowRight />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
