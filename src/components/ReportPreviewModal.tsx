import { X, Download, CheckCircle, TrendingUp, AlertTriangle, Target } from "lucide-react";

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'executive' | 'swot' | 'financial' | 'market' | 'culture' | 'quickwins' | '90day';
}

export default function ReportPreviewModal({ isOpen, onClose, reportType }: ReportPreviewModalProps) {
  if (!isOpen) return null;

  const reports = {
    executive: {
      title: "Executive Summary",
      subtitle: "Strategisch overzicht voor het MT",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">87%</div>
              <div className="text-sm text-gray-400">Overall Health Score</div>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B1538] to-[#D4AF37] w-[87%]" />
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">+32%</div>
              <div className="text-sm text-gray-400">Groeiprognose 12m</div>
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                Positieve trend
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">€2.8M</div>
              <div className="text-sm text-gray-400">Cashflow positie</div>
              <div className="mt-4 flex items-center gap-2 text-[#D4AF37] text-sm">
                <CheckCircle className="w-4 h-4" />
                Gezond
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Strategische Prioriteiten</h3>
            {[
              { title: "Marktexpansie BENELUX", impact: "Hoog", status: "In Progress" },
              { title: "Digital transformation", impact: "Hoog", status: "Planning" },
              { title: "Talent acquisition", impact: "Middel", status: "Active" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-sm text-gray-400">Impact: {item.impact}</div>
                </div>
                <div className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs font-semibold">
                  {item.status}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <h3 className="text-lg font-bold text-white mb-4">Key Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Sterke marktpositie met 23% marktaandeel in core segment</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Cashflow stabiel, working capital ratio van 2.8x</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Team retention needs attention (78% t.o.v. 85% benchmark)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },

    swot: {
      title: "SWOT Analyse",
      subtitle: "Strategische positiebepaling",
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-900/5 rounded-xl border border-green-500/30">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Sterke merkpositie in premium segment</li>
              <li>• Hoogwaardige productportfolio</li>
              <li>• Loyale klantenbasis (NPS 72)</li>
              <li>• Ervaren management team</li>
              <li>• Gezonde cashflow positie</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-red-900/20 to-red-900/5 rounded-xl border border-red-500/30">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Weaknesses
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Beperkte online aanwezigheid</li>
              <li>• Afhankelijkheid van key accounts</li>
              <li>• Legacy IT systemen</li>
              <li>• Hoge operationele kosten</li>
              <li>• Talent retention uitdaging</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-900/5 rounded-xl border border-blue-500/30">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Opportunities
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• BENELUX marktexpansie</li>
              <li>• E-commerce groei potentie</li>
              <li>• Strategische partnerships</li>
              <li>• Product line extensies</li>
              <li>• Sustainability leadership</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-900/5 rounded-xl border border-orange-500/30">
            <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Threats
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Toenemende concurrentie</li>
              <li>• Prijsdruk in markt</li>
              <li>• Economische onzekerheid</li>
              <li>• Regulatory changes</li>
              <li>• Supply chain risico's</li>
            </ul>
          </div>
        </div>
      )
    },

    financial: {
      title: "Financiële Gezondheid",
      subtitle: "Cashflow, liquiditeit en winstgevendheid",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Cashflow (YTD)</div>
              <div className="text-2xl font-bold text-[#D4AF37]">€2.8M</div>
              <div className="text-xs text-green-400 mt-1">+18% vs vorig jaar</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Current Ratio</div>
              <div className="text-2xl font-bold text-[#D4AF37]">2.8x</div>
              <div className="text-xs text-gray-400 mt-1">Target: 2.0x+</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-gray-400 mb-1">EBITDA Marge</div>
              <div className="text-2xl font-bold text-[#D4AF37]">23%</div>
              <div className="text-xs text-green-400 mt-1">Boven benchmark</div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <h3 className="text-lg font-bold text-white mb-4">Cashflow Trend (6 maanden)</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {[0.6, 0.7, 0.65, 0.8, 0.85, 0.9].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-[#8B1538] to-[#D4AF37] rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height * 100}%` }}
                  />
                  <div className="text-xs text-gray-500">M{i+1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Financiële Ratio's</h3>
            {[
              { label: "Quick Ratio", value: "1.8", benchmark: "1.5+", status: "good" },
              { label: "Debt-to-Equity", value: "0.4", benchmark: "<1.0", status: "good" },
              { label: "Working Capital", value: "€1.2M", benchmark: "Positief", status: "good" },
              { label: "Days Sales Outstanding", value: "42", benchmark: "<45", status: "good" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{item.label}</div>
                  <div className="text-sm text-gray-400">Benchmark: {item.benchmark}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#D4AF37]">{item.value}</div>
                  <div className="text-xs text-green-400">Gezond</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    market: {
      title: "Marktpositie & Benchmarks",
      subtitle: "Concurrentiepositie en marktaandeel",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold text-white mb-4">Marktaandeel</h3>
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">23%</div>
              <div className="text-sm text-gray-400 mb-4">In core segment</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uw organisatie</span>
                  <span className="text-[#D4AF37] font-semibold">23%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8B1538] to-[#D4AF37] w-[23%]" />
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-400">Concurrent A</span>
                  <span className="text-gray-400">31%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-600 w-[31%]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Concurrent B</span>
                  <span className="text-gray-400">19%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-600 w-[19%]" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold text-white mb-4">NPS Score</h3>
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">72</div>
              <div className="text-sm text-gray-400 mb-4">Net Promoter Score</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span className="text-sm text-gray-300">Promoters</span>
                  <span className="text-green-400 font-semibold">68%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span className="text-sm text-gray-300">Passives</span>
                  <span className="text-gray-400 font-semibold">28%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span className="text-sm text-gray-300">Detractors</span>
                  <span className="text-red-400 font-semibold">4%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Benchmark Vergelijking</h3>
            <div className="space-y-4">
              {[
                { metric: "Customer Satisfaction", yours: 8.2, industry: 7.4 },
                { metric: "Response Time", yours: 2.1, industry: 3.8 },
                { metric: "Product Quality", yours: 8.7, industry: 7.9 },
                { metric: "Price Competitiveness", yours: 7.1, industry: 7.5 }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{item.metric}</span>
                    <span className="text-[#D4AF37] font-semibold">{item.yours} vs {item.industry}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B1538] to-[#D4AF37]"
                      style={{ width: `${(item.yours / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    culture: {
      title: "Onderstroom & Cultuur",
      subtitle: "Team dynamiek en organisatiecultuur",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold text-white mb-4">Psychologische Veiligheid</h3>
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">7.8</div>
              <div className="text-sm text-gray-400 mb-4">Op schaal van 10</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Speak-up cultuur</span>
                  <span className="text-[#D4AF37]">8.2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Innovatie vrijheid</span>
                  <span className="text-[#D4AF37]">7.9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Faalveiligheid</span>
                  <span className="text-orange-400">6.8</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold text-white mb-4">Engagement Score</h3>
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">78%</div>
              <div className="text-sm text-gray-400 mb-4">Team betrokkenheid</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Zeer betrokken</span>
                  <span className="text-green-400">42%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Betrokken</span>
                  <span className="text-[#D4AF37]">36%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Onbetrokken</span>
                  <span className="text-orange-400">22%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Culturele Patronen</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Sterke samenwerking tussen teams</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Hoge mate van autonomie</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Transparante communicatie</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded border border-orange-500/30">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Hiërarchische besluitvorming</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded border border-orange-500/30">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Lage experimenteer-cultuur</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded border border-orange-500/30">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">Beperkte feedback loops</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <h3 className="text-lg font-bold text-white mb-4">Aanbevelingen</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">1</span>
                </div>
                <span className="text-gray-300">Implementeer bi-weekly team retrospectives</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">2</span>
                </div>
                <span className="text-gray-300">Start een "innovation hour" per week</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">3</span>
                </div>
                <span className="text-gray-300">Organiseer quarterly all-hands meetings</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },

    quickwins: {
      title: "Quick Wins",
      subtitle: "Direct implementeerbare verbeteringen",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-900/5 rounded-xl border border-green-500/30">
              <div className="text-2xl font-bold text-green-400 mb-2">7-14 dagen</div>
              <div className="text-sm text-gray-400">Implementatie tijd</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
              <div className="text-2xl font-bold text-[#D4AF37] mb-2">€125K</div>
              <div className="text-sm text-gray-400">Verwachte besparing</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-900/5 rounded-xl border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400 mb-2">12</div>
              <div className="text-sm text-gray-400">Geïdentificeerde wins</div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Pricing optimalisatie Premium segment",
                impact: "€50K",
                effort: "Low",
                timeline: "1 week",
                category: "Revenue"
              },
              {
                title: "Automatiseer factuurverwerking",
                impact: "20h/week",
                effort: "Medium",
                timeline: "2 weken",
                category: "Efficiency"
              },
              {
                title: "Heronderhandel software licenties",
                impact: "€35K/jaar",
                effort: "Low",
                timeline: "1 week",
                category: "Cost"
              },
              {
                title: "Optimaliseer marketing spend",
                impact: "€28K",
                effort: "Low",
                timeline: "1 week",
                category: "Cost"
              },
              {
                title: "Implementeer customer self-service",
                impact: "15h/week",
                effort: "Medium",
                timeline: "2 weken",
                category: "Efficiency"
              }
            ].map((win, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#D4AF37]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <span className="text-black text-sm font-bold">{i + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{win.title}</h3>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400 ml-11">
                      <span>Timeline: {win.timeline}</span>
                      <span>•</span>
                      <span>Effort: {win.effort}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#D4AF37] mb-1">{win.impact}</div>
                    <div className="px-3 py-1 bg-[#8B1538]/30 rounded-full text-xs text-white">
                      {win.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <h3 className="text-lg font-bold text-white mb-4">Totaal Impact (12 maanden)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-1">€125K</div>
                <div className="text-sm text-gray-400">Cost savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-1">60h/week</div>
                <div className="text-sm text-gray-400">Time savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-1">+18%</div>
                <div className="text-sm text-gray-400">Efficiency gain</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    '90day': {
      title: "90-Dagenplan",
      subtitle: "Concrete actiepunten met eigenaren en deadlines",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#8B1538]/5 rounded-xl border border-[#8B1538]/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-[#8B1538]/30 rounded-lg text-[#D4AF37] text-sm">Maand 1</span>
              </h3>
              <div className="text-sm font-semibold text-[#D4AF37] mb-3">Foundation</div>
              <div className="space-y-3">
                {[
                  { action: "SWOT Workshop MT", owner: "CEO", week: "Week 2" },
                  { action: "Marktanalyse finaliseren", owner: "Marketing", week: "Week 3" },
                  { action: "3 strategische prio's", owner: "MT", week: "Week 4" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-black text-xs font-bold">{i + 1}</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{item.action}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-7">
                      {item.owner} • {item.week}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-[#D4AF37]/30 rounded-lg text-[#D4AF37] text-sm">Maand 2</span>
              </h3>
              <div className="text-sm font-semibold text-[#D4AF37] mb-3">Implementation</div>
              <div className="space-y-3">
                {[
                  { action: "Roadmap per prioriteit", owner: "Projectleiders", week: "Week 6" },
                  { action: "Pricing strategie testen", owner: "Sales", week: "Week 7" },
                  { action: "Quick wins implementeren", owner: "Operations", week: "Week 8" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{i + 4}</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{item.action}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-7">
                      {item.owner} • {item.week}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/20 rounded-xl border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-lg text-white text-sm">Maand 3</span>
              </h3>
              <div className="text-sm font-semibold text-[#D4AF37] mb-3">Optimization</div>
              <div className="space-y-3">
                {[
                  { action: "KPI dashboard live", owner: "BI/Analytics", week: "Week 10" },
                  { action: "Impact meting", owner: "MT", week: "Week 12" },
                  { action: "Q2 strategie bijstelling", owner: "CEO", week: "Week 13" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{i + 7}</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{item.action}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-7">
                      {item.owner} • {item.week}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-[#8B1538]/20 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <h3 className="text-lg font-bold text-white mb-4">Kritieke Succesfactoren</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">MT commitment & ownership</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">Weekly voortgangsmonitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">Clear communication naar teams</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">Budget allocatie secured</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">Dedicated project resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-300">Blocker escalation process</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Verwachte Resultaten na 90 dagen</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-2">+25%</div>
                <div className="text-sm text-gray-400">Operational efficiency</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-2">€180K</div>
                <div className="text-sm text-gray-400">Realized savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-2">9/9</div>
                <div className="text-sm text-gray-400">Completed actions</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const report = reports[reportType];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-b from-[#1a0a0f] to-[#2d1319] border-b border-white/10 p-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{report.title}</h2>
            <p className="text-gray-400">{report.subtitle}</p>
          </div>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
              <Download className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37]" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          {report.content}
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/10 p-6 bg-gradient-to-b from-[#2d1319] to-[#1a0a0f]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Dit is een voorbeeld rapport • Uw eigen rapport wordt gegenereerd op basis van uw specifieke data
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
