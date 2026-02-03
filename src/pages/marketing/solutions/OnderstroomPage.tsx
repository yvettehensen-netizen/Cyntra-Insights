import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { AlertTriangle, Eye, Brain, FileText, ArrowRight } from "lucide-react";

export default function OnderstroomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="pt-32 pb-24">
        <section className="text-center container mx-auto px-6 max-w-4xl mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Onderstroom Analyse
          </h1>
          <p className="text-xl text-gray-300">
            Patronen, spanningen, politiek gedrag en niet-uitgesproken dynamieken zichtbaar gemaakt.
          </p>
        </section>

        <section className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-10">
          {[
            {
              icon: Eye,
              title: "Onzichtbare Patronen",
              desc: "Wat gebeurt er écht? Welke gesprekken worden niet gevoerd?",
            },
            {
              icon: AlertTriangle,
              title: "Conflictlijnen",
              desc: "Analyse van spanningen, miscommunicatie en loyaliteitsconflicten.",
            },
            {
              icon: Brain,
              title: "Veiligheid & Vertrouwen",
              desc: "In hoeverre voelen teams zich gehoord en veilig om te spreken?",
            },
            {
              icon: FileText,
              title: "Onderstroom Kaart",
              desc: "Kaart van emoties, drijfveren en weerstandspunten.",
            },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <item.icon className="w-10 h-10 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="text-center mt-20">
          <a
            href="/quickscan-gratis"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] text-white rounded-xl font-semibold"
          >
            Start Onderstroom Analyse
            <ArrowRight />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
