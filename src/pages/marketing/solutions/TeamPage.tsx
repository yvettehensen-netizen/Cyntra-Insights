import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { Users, HeartHandshake, Brain, BarChart3, ArrowRight } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="pt-32 pb-24">
        <section className="text-center container mx-auto px-6 max-w-4xl mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">Team & Cultuur</h1>
          <p className="text-xl text-gray-300">
            Analyse van teamdynamiek, leiderschap, cultuur, samenwerking en onderstroom.
          </p>
        </section>

        <section className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-10">
          {[
            {
              icon: Users,
              title: "Teamdynamiek",
              desc: "Samenwerking, rollen, verantwoordelijkheden en conflictlijnen.",
            },
            {
              icon: HeartHandshake,
              title: "Cultuur DNA",
              desc: "Wat versterkt je organisatie en wat remt haar af? Wordt alles uitgesproken?",
            },
            {
              icon: Brain,
              title: "Leiderschapsanalyse",
              desc: "Leiderschapsgedrag, communicatie & besluitvorming.",
            },
            {
              icon: BarChart3,
              title: "Engagement & Moraliteit",
              desc: "De 'gezondheid' van je team: energie, veiligheid en alignment.",
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
          <Link
            to="/quickscan-gratis"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] text-white rounded-xl font-semibold"
          >
            Start Team Analyse
            <ArrowRight />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
