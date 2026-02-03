import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";
import { Briefcase, Users, FileText, ArrowRight } from "lucide-react";

export default function VoorConsultantsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <PublicNavbar />

      <main className="pt-40 pb-24 container mx-auto px-6 max-w-5xl">
        
        <h1 className="text-6xl font-bold text-white text-center mb-6">
          Voor Consultants & Adviesbureaus
        </h1>

        <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-16">
          Schaal jouw consultancy — lever premium analyses in recordtijd.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/consultants" className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <Briefcase className="w-10 h-10 text-[#D4AF37] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Consultants</h3>
            <p className="text-gray-400">Voor solo-consultants en kleine bureaus.</p>
          </Link>

          <Link to="/pricing" className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <Users className="w-10 h-10 text-[#D4AF37] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Pakketten & Tarieven</h3>
            <p className="text-gray-400">Inclusief white-label professional pakket.</p>
          </Link>

          <Link to="/demo" className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <FileText className="w-10 h-10 text-[#D4AF37] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Demo Rapport</h3>
            <p className="text-gray-400">Bekijk een volledig voorbeeldrapport.</p>
          </Link>
        </div>

        <div className="text-center mt-20">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B1538] to-[#6d1028] text-white rounded-xl font-semibold"
          >
            Bekijk Pakketten <ArrowRight />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
