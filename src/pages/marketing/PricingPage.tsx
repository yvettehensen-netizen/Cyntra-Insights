import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import {
  CheckCircle,
  Lock,
  Crown,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0a0d] text-gray-100 overflow-x-hidden">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-40 pb-32 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-radial from-[#8B1538]/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-[#D4AF37]/8 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <span className="px-6 py-3 inline-block bg-[#8B1538]/20 border border-[#D4AF37]/20 rounded-full text-[#D4AF37] font-medium tracking-wider mb-10">
            STRATEGISCHE BESLUITVORMING
          </span>

          <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-8">
            Pricing voor <br />
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#c29a32] bg-clip-text text-transparent">
              serieuze leiders
            </span>
          </h1>

          <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Cyntra is geen tool en geen rapportgenerator.  
            Aurelius is een besloten AI-omgeving voor strategische besluitvorming
            op directie- en boardniveau.
          </p>
        </div>
      </section>

      {/* ACCESS TIERS */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid md:grid-cols-2 gap-12">

          {/* CORE ACCESS */}
          <div className="relative p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-[#D4AF37]/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-12 h-12 text-[#D4AF37]" />
              <h3 className="text-4xl font-bold text-white">
                Core Access
              </h3>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-bold text-[#D4AF37]">€99</span>
              <span className="text-xl text-gray-400 mb-2">/ maand</span>
            </div>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Toegang tot de strategische Aurelius-omgeving.  
              Core Access is een licentie, geen analyse-abonnement.
            </p>

            <ul className="space-y-4 mb-10 text-gray-300">
              {[
                "Toegang tot Aurelius",
                "Beveiligd clientenportaal",
                "Strategische context & historie",
                "Basis dashboards",
                "Inzicht in beschikbare analysekaders (zonder output)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all text-lg font-medium"
            >
              Start Core Access
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          {/* EXECUTIVE ACCESS */}
          <div className="relative p-12 bg-gradient-to-br from-[#8B1538]/70 to-[#6d1028]/70 backdrop-blur-xl border-2 border-[#D4AF37] rounded-3xl shadow-2xl">
            <div className="absolute top-0 right-0 px-6 py-2 bg-[#D4AF37] text-black font-bold text-sm rounded-bl-2xl">
              VOOR STRUCTUREEL GEBRUIK
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Crown className="w-12 h-12 text-[#D4AF37]" />
              <h3 className="text-4xl font-bold text-white">
                Executive Access
              </h3>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-bold text-[#D4AF37]">€1.000+</span>
              <span className="text-xl text-gray-200 mb-2">/ maand</span>
            </div>

            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Voor organisaties die Aurelius structureel inzetten
              als onderdeel van strategische besluitvorming en verandering.
            </p>

            <ul className="space-y-4 mb-10 text-gray-100">
              {[
                "Alles van Core Access",
                "Strategische activaties inbegrepen binnen fair use",
                "Multi-user & teamtoegang",
                "Historische vergelijking & trends",
                "Prioriteit & executive begeleiding",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-black font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-lg"
            >
              Bespreek Executive Access
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVATIONS */}
      <section className="max-w-5xl mx-auto px-6 pb-40">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Analyse-activaties
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Analyse-activaties zijn geen producten.  
            Het zijn bewuste strategische interventies,
            geactiveerd op momenten die er toe doen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Strategic Analysis",
              price: "€950",
              desc: "Volledige strategische analyse binnen één domein, inclusief synthese en beslisimplicaties.",
            },
            {
              title: "Executive Synthesis",
              price: "€1.750",
              desc: "Samenhangende synthese over meerdere domeinen voor complexe besluitvorming.",
            },
            {
              title: "Board / 90-day Masterplan",
              price: "€2.500+",
              desc: "Board-ready strategie met scenario’s en concreet 90-dagen actieplan.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {item.title}
              </h3>
              <p className="text-4xl font-bold text-[#D4AF37] mb-6">
                {item.price}
              </p>
              <p className="text-gray-300 text-lg">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-20 flex flex-col items-center gap-6 text-gray-400">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
            <span>100% privacy — data direct gescrubd</span>
          </div>
          <span className="text-sm">
            Activaties vereisen een actief Aurelius-abonnement
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
