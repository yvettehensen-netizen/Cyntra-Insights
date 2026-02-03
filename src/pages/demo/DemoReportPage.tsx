import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, Shield } from "lucide-react";

export default function DemoReportPage() {
  const contextRaw = sessionStorage.getItem("cyntra_demo_context");
  const context = contextRaw ? JSON.parse(contextRaw) : null;

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-white px-6 py-32">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-24">
          <span className="inline-block px-5 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-8">
            Voorbeeldresultaat • Geanonimiseerd
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Strategisch inzicht<br />
            <span className="text-[#D4AF37]">zonder ruis</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Hieronder zie je een <strong>geanonimiseerde samenvatting</strong> van
            een Cyntra-analyse voor een organisatie in{" "}
            <span className="text-[#D4AF37] font-medium">
              {context?.industry ?? "een vergelijkbare sector"}
            </span>, met als kernvraag{" "}
            <span className="text-[#D4AF37] font-medium">
              {context?.challenge ?? "strategische focus en prioritering"}
            </span>.
          </p>
        </div>

        {/* ANONIEME SAMENVATTING */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12 mb-24 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#8B1538]/5 to-[#D4AF37]/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-4">
              <FileText className="text-[#D4AF37]" />
              Executive Summary — Geanonimiseerd
            </h2>

            <ul className="space-y-6 text-lg text-gray-300">
              <li className="flex gap-4">
                <CheckCircle className="text-[#D4AF37] mt-1" />
                De organisatie bevindt zich in een groeifase waarin complexiteit sneller toeneemt dan besluitvorming.
              </li>

              <li className="flex gap-4">
                <CheckCircle className="text-[#D4AF37] mt-1" />
                Strategische keuzes worden reactief genomen, wat leidt tot versnippering van focus en capaciteit.
              </li>

              <li className="flex gap-4">
                <CheckCircle className="text-[#D4AF37] mt-1" />
                De grootste hefboom ligt in scherpere prioritering, expliciete keuzes en heldere eigenaarschapstructuur.
              </li>
            </ul>

            <div className="mt-10 p-6 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-4">
              <Shield className="text-[#D4AF37] mt-1" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Deze samenvatting is bewust beperkt en geanonimiseerd.
                Het volledige rapport bevat onder andere:
                strategische scenario’s, risicoanalyse, besluitvormingspatronen
                en een concreet actie- en prioriteitenkader.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-4xl font-bold mb-8">
            Ontvang helderheid in je strategische keuzes
          </h3>

          <p className="text-xl text-gray-400 mb-14 max-w-2xl mx-auto leading-relaxed">
            Ontvang direct strategische richting en focus.
            Het volledige, boardroom-klare rapport volgt
            <strong> binnen 24 uur</strong>.
          </p>

          <Link
            to="/quickscan"
            className="inline-flex items-center gap-4 px-14 py-6 rounded-2xl bg-[#D4AF37] text-black font-bold text-xl hover:bg-[#e0c04a] hover:shadow-[#D4AF37]/60 hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Ontvang mijn strategisch inzicht
            <ArrowRight />
          </Link>

          <div className="mt-8 text-sm text-gray-500">
            ± 5 minuten • Geen salesgesprek • Volledig vertrouwelijk
          </div>
        </div>
      </div>
    </section>
  );
}
