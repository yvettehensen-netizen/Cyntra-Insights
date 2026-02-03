import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { Download, ArrowRight, CheckCircle, BarChart3, TrendingUp, Target, Users, Shield, Zap, FileText, AlertCircle } from "lucide-react";

export default function DemoReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main>
        {/* HERO / INTRO */}
        <section className="pt-32 pb-16 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-sm text-[#D4AF37] font-medium mb-4">
                Voorbeeldrapport
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white">
                Boardroom-Klaar Strategisch Rapport
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Bekijk hoe een Cyntra Insights rapport eruitziet. Strategische analyses, financiële inzichten en een concreet 90-dagenplan — alles wat directie en MT nodig hebben.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <button className="group px-8 py-4 bg-gradient-to-r from-[#8B1538] to-[#6d1028] hover:from-[#6d1028] hover:to-[#8B1538] text-white font-semibold rounded-xl shadow-lg shadow-[#8B1538]/30 transition-all duration-300 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Voorbeeldrapport (PDF)
                </button>

                <Link
                  to="/quickscan"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Start Jouw Analyse
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* EXECUTIVE SUMMARY PREVIEW */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Executive Summary</h2>
                    <p className="text-gray-400">Het hele verhaal in 2 pagina's — MT-klaar en direct presenteerbaar</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-3">Strategische Positie</h3>
                    <p className="text-gray-300 leading-relaxed">
                      De organisatie bevindt zich in een groeiende markt met sterke concurrentie. De huidige marktpositie is solide (top 3 in segment), maar vraagt om innovatie en digitalisering om voorsprong te behouden.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Sterktes
                      </h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Sterke cashflow positie</li>
                        <li>• Loyale klantenbasis (85% retention)</li>
                        <li>• Ervaren management team</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
                      <h4 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Aandachtspunten
                      </h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Afhankelijkheid van 3 grote klanten</li>
                        <li>• Verouderde IT-infrastructuur</li>
                        <li>• Beperkte online aanwezigheid</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
                    <h4 className="font-semibold text-[#D4AF37] mb-3">Top 3 Strategische Prioriteiten</h4>
                    <ol className="space-y-3">
                      <li className="flex gap-3 text-gray-300">
                        <span className="font-bold text-[#D4AF37]">1.</span>
                        <span>Diversificatie klantportfolio: target 10 nieuwe mid-tier klanten (Q1-Q2)</span>
                      </li>
                      <li className="flex gap-3 text-gray-300">
                        <span className="font-bold text-[#D4AF37]">2.</span>
                        <span>Digitale transformatie: implementeer CRM + e-commerce platform (Q2-Q3)</span>
                      </li>
                      <li className="flex gap-3 text-gray-300">
                        <span className="font-bold text-[#D4AF37]">3.</span>
                        <span>Teamontwikkeling: upskilling programma voor digital skills (doorlopend)</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPORT MODULES GRID */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Wat Zit Er In Het Rapport?</h2>
              <p className="text-xl text-gray-400">8 geïntegreerde analysemodules voor een compleet strategisch beeld</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  icon: Target,
                  title: "SWOT Analyse",
                  items: ["Sterke/zwakke punten", "Kansen & bedreigingen", "Strategische aanbevelingen"]
                },
                {
                  icon: BarChart3,
                  title: "Financiële Gezondheid",
                  items: ["Cashflow analyse", "Liquiditeit & solvabiliteit", "Rentabiliteit benchmarks"]
                },
                {
                  icon: TrendingUp,
                  title: "Groei & Expansie",
                  items: ["Marktpotentieel", "Schaalmogelijkheden", "Innovatiekansen"]
                },
                {
                  icon: Users,
                  title: "Teamdynamiek",
                  items: ["Cultuur scan", "Leiderschapsstijl", "Samenwerkingspatronen"]
                },
                {
                  icon: Shield,
                  title: "Risicomanagement",
                  items: ["Compliance check", "Weerbaarheid", "Continuïteitsplan"]
                },
                {
                  icon: Zap,
                  title: "Quick Wins",
                  items: ["Direct implementeerbaar", "Low-hanging fruit", "ROI per actie"]
                },
                {
                  icon: BarChart3,
                  title: "Benchmarks",
                  items: ["Sector vergelijking", "KPI's vs. concurrentie", "Best practices"]
                },
                {
                  icon: CheckCircle,
                  title: "90-Dagenplan",
                  items: ["Concrete actiepunten", "Tijdlijnen & eigenaren", "Succes metrics"]
                }
              ].map((module, i) => (
                <div key={i} className="group p-6 bg-gradient-to-br from-white/5 to-white/0 hover:from-[#8B1538]/10 hover:to-[#D4AF37]/5 border border-white/10 rounded-2xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <module.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">{module.title}</h3>

                  <ul className="space-y-2">
                    {module.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SAMPLE PAGES PREVIEW */}
        <section className="py-16 bg-gradient-to-b from-[#1a0a0f] to-[#2d1319] relative">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-12 text-center">Rapportage Preview</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Pagina 3-4: Strategische Analyse",
                    description: "SWOT matrix, marktpositie, concurrentie-analyse en strategische aanbevelingen"
                  },
                  {
                    title: "Pagina 5-8: Financiële Diepte-analyse",
                    description: "Cashflow, liquiditeit, marges, working capital en benchmarks"
                  },
                  {
                    title: "Pagina 12-15: Teamdynamiek & Onderstroom",
                    description: "Culturele patronen, leiderschapsstijl en samenwerkingskwaliteit"
                  },
                  {
                    title: "Pagina 38-42: 90-Dagenplan",
                    description: "Concrete actiepunten met eigenaren, deadlines en succes metrics"
                  }
                ].map((page, i) => {
                  // Define preview visuals per page
                  const previews = [
                    // Page 1: Executive Summary
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] rounded-xl overflow-hidden border border-white/10">
                      <div className="absolute inset-0 p-8">
                        <div className="text-xs text-[#D4AF37] mb-6">EXECUTIVE SUMMARY</div>
                        <div className="space-y-3">
                          <div className="h-2 bg-gradient-to-r from-[#D4AF37] to-transparent w-3/4 rounded" />
                          <div className="h-2 bg-gradient-to-r from-[#8B1538] to-transparent w-1/2 rounded" />
                          <div className="grid grid-cols-2 gap-2 mt-6">
                            <div className="p-3 bg-[#8B1538]/20 rounded-lg border border-[#D4AF37]/30">
                              <div className="text-[#D4AF37] font-bold text-xs">87%</div>
                              <div className="text-[8px] text-gray-500">Score</div>
                            </div>
                            <div className="p-3 bg-[#8B1538]/20 rounded-lg border border-[#D4AF37]/30">
                              <div className="text-[#D4AF37] font-bold text-xs">+32%</div>
                              <div className="text-[8px] text-gray-500">Growth</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>,

                    // Page 2: Strategische Analyse
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] rounded-xl overflow-hidden border border-white/10">
                      <div className="absolute inset-0 p-8">
                        <div className="text-xs text-[#D4AF37] mb-4">SWOT ANALYSIS</div>
                        <div className="grid grid-cols-2 gap-2">
                          {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map((label, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                              <div className="text-[8px] text-gray-400 mb-2">{label}</div>
                              <div className="space-y-1">
                                <div className="h-1 bg-[#D4AF37]/50 w-full rounded" />
                                <div className="h-1 bg-[#8B1538]/50 w-3/4 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>,

                    // Page 3: Financiële Analyse
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] rounded-xl overflow-hidden border border-white/10">
                      <div className="absolute inset-0 p-8">
                        <div className="text-xs text-[#D4AF37] mb-4">FINANCIAL HEALTH</div>
                        <div className="space-y-3">
                          <div className="p-3 bg-[#8B1538]/20 rounded border border-[#D4AF37]/30">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-400">Cashflow</span>
                              <span className="text-xs font-bold text-[#D4AF37]">€2.4M</span>
                            </div>
                          </div>
                          <div className="p-3 bg-[#8B1538]/20 rounded border border-[#D4AF37]/30">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-400">Liquidity</span>
                              <span className="text-xs font-bold text-[#D4AF37]">2.8x</span>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-4">
                            {[0.6, 0.7, 0.5, 0.8, 0.9, 1.0].map((h, idx) => (
                              <div key={idx} className="flex-1 bg-gradient-to-t from-[#8B1538] to-[#D4AF37] rounded-t" style={{height: `${h * 40}px`}} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>,

                    // Page 4: 90-Dagenplan
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] rounded-xl overflow-hidden border border-white/10">
                      <div className="absolute inset-0 p-8">
                        <div className="text-xs text-[#D4AF37] mb-4">90-DAGEN ACTIEPLAN</div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Maand 1', 'Maand 2', 'Maand 3'].map((month, idx) => (
                            <div key={idx} className="p-2 bg-white/5 rounded border border-white/10">
                              <div className="text-[8px] text-[#D4AF37] font-bold mb-2">{month}</div>
                              <div className="space-y-1">
                                {[1, 2, 3].map(n => (
                                  <div key={n} className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full text-[6px] flex items-center justify-center text-black font-bold">{n}</div>
                                    <div className="h-[2px] bg-gradient-to-r from-[#8B1538] to-transparent flex-1 rounded" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ];

                  return (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[#D4AF37]/30 transition-all group">
                      {previews[i]}
                      <h3 className="text-xl font-bold text-white mb-2 mt-6 group-hover:text-[#D4AF37] transition-colors">{page.title}</h3>
                      <p className="text-gray-400 mb-4">{page.description}</p>
                      <Link
                        to="/demo-report"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Bekijk Voorbeeld
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* REPORT SPECS */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-[#D4AF37] mb-2">28-42</div>
                  <div className="text-gray-400">Pagina's per rapport</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-[#D4AF37] mb-2">112+</div>
                  <div className="text-gray-400">Data-punten geanalyseerd</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-[#D4AF37] mb-2">24u</div>
                  <div className="text-gray-400">Levertijd garantie</div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Rapportage Formaten</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">PDF (boardroom-ready)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">PowerPoint (presentatie-klaar)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">Excel (data voor verdere analyse)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">Word (bewerkbaar)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">Online dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-300">White-label optie (Enterprise)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Klaar voor Jouw Eigen Rapport?
              </h2>

              <p className="text-xl text-gray-300 mb-8">
                Start met een gratis Quickscan en ontvang binnen 24 uur jouw strategisch bedrijfsrapport
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/quickscan"
                  className="group px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] hover:from-[#6d1028] hover:to-[#8B1538] text-white text-lg font-semibold rounded-xl shadow-2xl shadow-[#8B1538]/40 transition-all duration-300 flex items-center gap-3"
                >
                  Start Gratis Quickscan
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/pricing"
                  className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Bekijk Pakketten
                </Link>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                Geen creditcard vereist • Direct resultaat • 100% vertrouwelijk
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
