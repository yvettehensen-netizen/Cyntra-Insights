import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, Shield } from "lucide-react";

export default function DemoReportPage() {
  const contextRaw = sessionStorage.getItem("cyntra_demo_context");
  const context = contextRaw ? JSON.parse(contextRaw) : null;

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-white px-6 py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-5 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-8">
            Voorbeeldresultaat • Bestuurlijk Besluitdocument
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Geen rapport.
            <br />
            Wel interventiekader.
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Geanonimiseerde samenvatting voor {context?.industry ?? "een vergelijkbare sector"} rond de vraag: {context?.challenge ?? "welke keuze niet langer uitstelbaar is"}.
          </p>
        </div>

        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12 mb-20 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#8B1538]/5 to-[#D4AF37]/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <FileText className="text-[#D4AF37]" />
              Kernstructuur
            </h2>

            <ul className="space-y-5 text-lg text-gray-300">
              <li className="flex gap-4"><CheckCircle className="text-[#D4AF37] mt-1" />Dominante These</li>
              <li className="flex gap-4"><CheckCircle className="text-[#D4AF37] mt-1" />Structurele Kernspanning en Onvermijdelijke Keuzes</li>
              <li className="flex gap-4"><CheckCircle className="text-[#D4AF37] mt-1" />90-dagen interventieontwerp met 6 kerninterventies en beslisgates</li>
              <li className="flex gap-4"><CheckCircle className="text-[#D4AF37] mt-1" />Decision contract met expliciet verlies en mandaatverschuiving</li>
            </ul>

            <div className="mt-10 p-6 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-4">
              <Shield className="text-[#D4AF37] mt-1" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Dit document is beperkt en geanonimiseerd. Volledige versie wordt in de besloten omgeving afgedwongen op ritme en eigenaarschap.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-4xl font-bold mb-8">Plan de intake als besluituitstel moet stoppen</h3>

          <Link
            to="/contact"
            className="inline-flex items-center gap-4 px-14 py-6 rounded-2xl bg-[#D4AF37] text-black font-bold text-xl hover:bg-[#e0c04a] transition-all duration-300"
          >
            Plan een Bestuurlijke Intake
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
