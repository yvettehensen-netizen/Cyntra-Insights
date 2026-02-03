import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { BarChart3, FileText, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="text-center container mx-auto px-6 max-w-4xl mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Financiële Gezondheid
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Analyse van cashflow, marges, winstgevendheid, KPI’s en sectorbenchmarks.
          </p>
        </section>

        {/* CONTENT */}
        <section className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-10">
          {[
            {
              icon: BarChart3,
              title: "Cashflow & Liquiditeit",
              desc: "Volledige analyse van je cashflowpositie, burn rate en liquiditeit.",
            },
            {
              icon: TrendingUp,
              title: "Rentabiliteit",
              desc: "Breng marges, winstgevendheid en inefficiënties helder in beeld.",
            },
            {
              icon: FileText,
              title: "Financiële KPI’s",
              desc: "Kritieke indicatoren zoals solvabiliteit, DSCR, DIO, DSO en DPO.",
            },
            {
              icon: AlertTriangle,
              title: "Risico’s & Kwetsbaarheden",
              desc: "Ontdek financiële risico’s en hoe je ze kunt mitigeren.",
            },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <item.icon className="w-10 h-10 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="text-center mt-20">
          <a
            href="/quickscan-gratis"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] text-white rounded-xl font-semibold"
          >
            Start Financiële Analyse
            <ArrowRight />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
