import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { ArrowRight, CheckCircle, Palette, Eye, FileText, Download, Settings, Shield } from "lucide-react";

export default function ConsultantsWhiteLabelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main>
        {/* HERO */}
        <section className="pt-32 pb-16 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Link
                to="/consultants"
                className="inline-flex items-center gap-2 text-[#D4AF37] hover:underline mb-4"
              >
                ← Terug naar Voor Consultants
              </Link>

              <h1 className="text-5xl lg:text-6xl font-bold text-white">
                White-Label Rapportage
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Lever rapporten onder uw eigen naam en huisstijl. Cyntra blijft volledig onzichtbaar voor uw klant.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT IS WHITE-LABEL */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Wat is White-Label?
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Met white-label branding levert u rapporten die volledig op uw adviesbureau zijn gebrand. Uw logo, uw kleuren, uw contactgegevens — alsof u het zelf heeft gemaakt.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Cyntra wordt nergens genoemd in het rapport",
                      "Uw logo op elke pagina (header/footer)",
                      "Uw huisstijl kleuren en fonts",
                      "Uw contactgegevens en disclaimer",
                      "Perfect voor doorverkoop aan klanten"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="space-y-6">
                    <div className="p-4 bg-[#8B1538]/10 border border-[#8B1538]/30 rounded-xl">
                      <h4 className="text-white font-semibold mb-2">Zonder White-Label:</h4>
                      <p className="text-sm text-gray-400">"Rapport gegenereerd door Cyntra Insights"</p>
                    </div>

                    <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
                      <h4 className="text-white font-semibold mb-2">Met White-Label:</h4>
                      <p className="text-sm text-gray-400">"Rapport opgesteld door [UW BEDRIJF]"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOMIZATION OPTIONS */}
        <section className="py-24 bg-gradient-to-b from-[#1a0a0f] to-[#2d1319] relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Wat Kunt U Aanpassen?
              </h2>
              <p className="text-xl text-gray-400">
                Volledige controle over de branding van uw rapporten
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: Palette,
                  title: "Logo & Huisstijl",
                  items: ["Uw logo in header/footer", "Primaire en secundaire kleuren", "Custom fonts (optioneel)", "Favicon voor online rapporten"]
                },
                {
                  icon: FileText,
                  title: "Inhoud & Tekst",
                  items: ["Bedrijfsnaam overal", "Contactgegevens", "Eigen disclaimer tekst", "Custom footers per pagina"]
                },
                {
                  icon: Eye,
                  title: "Zichtbaarheid",
                  items: ["Geen Cyntra logo/tekst", "Geen 'Powered by' melding", "Volledige anonimiteit", "100% uw merk"]
                },
                {
                  icon: Download,
                  title: "Export Formaten",
                  items: ["Gebrandde PDF", "Gebrandde PowerPoint", "Gebrandde Word doc", "Online white-label portal"]
                },
                {
                  icon: Settings,
                  title: "Templates",
                  items: ["Sla templates op", "Hergebruik per klant", "Verschillende templates", "Quick setup nieuwe klanten"]
                },
                {
                  icon: Shield,
                  title: "Privacy & Rechten",
                  items: ["U bent eigenaar content", "Geen Cyntra watermerks", "Commercieel gebruik OK", "Doorverkoop toegestaan"]
                }
              ].map((option, i) => (
                <div key={i} className="p-8 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center mb-6">
                    <option.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{option.title}</h3>
                  <ul className="space-y-2">
                    {option.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVENUE MODEL */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Extra Inkomstenmodel
                </h2>
                <p className="text-xl text-gray-400">
                  Hoe u geld verdient met white-label rapporten
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    model: "Doorverkoop",
                    description: "Koop rapport voor €249, verkoop voor €2.500+",
                    margin: "€2.250+ marge"
                  },
                  {
                    model: "Upsell Module",
                    description: "Voeg rapporten toe aan bestaande diensten",
                    margin: "20-30% extra omzet"
                  },
                  {
                    model: "Retainer Model",
                    description: "Maandelijkse rapporten als onderdeel van retainer",
                    margin: "Recurring revenue"
                  }
                ].map((model, i) => (
                  <div key={i} className="p-8 bg-gradient-to-br from-[#8B1538]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-2xl text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">{model.model}</h3>
                    <p className="text-gray-400 mb-4">{model.description}</p>
                    <div className="text-[#D4AF37] font-bold text-lg">{model.margin}</div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Rekenvoorbeeld
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Uw kosten (Cyntra)</div>
                    <div className="text-3xl font-bold text-white">€249</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Uw verkoopprijs</div>
                    <div className="text-3xl font-bold text-[#D4AF37]">€2.500</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Uw marge</div>
                    <div className="text-3xl font-bold text-green-400">€2.251</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-24 bg-gradient-to-b from-[#2d1319] to-[#1a0a0f] relative">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                White-Label Pricing
              </h2>
              <p className="text-xl text-gray-400">
                Inbegrepen bij Professional en Enterprise pakketten
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">Professional</h3>
                <div className="text-5xl font-bold text-[#D4AF37] mb-2">€499</div>
                <div className="text-gray-400 mb-6">/maand</div>

                <ul className="space-y-3 mb-8">
                  {[
                    "✅ White-label branding",
                    "✅ Onbeperkte rapporten",
                    "✅ Alle 8 modules",
                    "✅ PDF + PowerPoint export",
                    "✅ Priority support"
                  ].map((item, i) => (
                    <li key={i} className="text-gray-300">{item}</li>
                  ))}
                </ul>

                <Link
                  to="/pricing"
                  className="block w-full py-3 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] text-white text-center font-semibold rounded-xl hover:from-[#6d1028] hover:to-[#c09d2f] transition-all"
                >
                  Kies Professional
                </Link>
              </div>

              <div className="p-8 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 border-2 border-[#D4AF37] rounded-2xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4AF37] text-black text-sm font-bold rounded-full">
                  MEEST GEKOZEN
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div className="text-5xl font-bold text-[#D4AF37] mb-2">Op maat</div>
                <div className="text-gray-400 mb-6">custom pricing</div>

                <ul className="space-y-3 mb-8">
                  {[
                    "✅ Alles van Professional",
                    "✅ Custom templates",
                    "✅ API toegang",
                    "✅ Multi-tenant support",
                    "✅ Dedicated account manager",
                    "✅ SLA garanties"
                  ].map((item, i) => (
                    <li key={i} className="text-gray-300">{item}</li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className="block w-full py-3 bg-[#D4AF37] text-black text-center font-semibold rounded-xl hover:bg-[#c09d2f] transition-all"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Start Vandaag met White-Label
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                14 dagen gratis proberen • Geen creditcard vereist
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/pricing"
                  className="px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] hover:from-[#6d1028] hover:to-[#8B1538] text-white text-lg font-semibold rounded-xl shadow-2xl shadow-[#8B1538]/40 transition-all duration-300 flex items-center gap-3"
                >
                  Start 14-Dagen Proef
                  <ArrowRight className="w-6 h-6" />
                </Link>

                <Link
                  to="/demo"
                  className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Bekijk Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
