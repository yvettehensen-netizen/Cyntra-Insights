import { Link } from "react-router-dom";
import {
  BarChart3,
  Brain,
  FileText,
  Shield,
  ArrowRight,
  Layers,
  Crown,
  Zap,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

export default function PortalHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#0F0F0F] to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs uppercase tracking-widest bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            <Shield size={14} />
            Besloten omgeving
          </span>

          <h1 className="text-5xl font-bold">
            Welkom in jouw <span className="text-[#D4AF37]">Aurelius Portal</span>
          </h1>

          <p className="text-lg text-gray-400">
            Deze portal is jouw strategische toegangspoort.
            <br />
            <strong className="text-white">
              Analyses worden pas uitgevoerd vanuit jouw persoonlijke dashboard.
            </strong>
          </p>
        </motion.section>

        {/* HOE HET WERKT */}
        <section className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-8 space-y-4">
          <h2 className="text-2xl font-bold">Hoe je Aurelius gebruikt</h2>
          <ol className="list-decimal ml-6 space-y-2 text-gray-400">
            <li>Ga naar jouw persoonlijke dashboard</li>
            <li>Start een nieuwe analyse vanuit het dashboard</li>
            <li>De orchestrator activeert AI-consultanten</li>
            <li>Resultaten worden gespiegeld en geconsolideerd</li>
            <li>Besluitrapport en executive summary worden gegenereerd</li>
          </ol>
        </section>

        {/* ANALYSE TYPES */}
        <section className="grid md:grid-cols-3 gap-6">
          <InfoCard
            icon={Zap}
            title="QuickScan"
            text="Snelle diagnose van spanningen en blinde vlekken."
          />
          <InfoCard
            icon={Globe}
            title="DeepDive Analyse"
            text="Parallelle analyse door meerdere AI-consultanten."
          />
          <InfoCard
            icon={Crown}
            title="Executive Synthesis"
            text="Consensus, conflict-resolutie en besluitadvies."
          />
        </section>

        {/* CTA BLOKKEN */}
        <section className="grid md:grid-cols-3 gap-6">

          {/* ✅ DEZE IS DE BELANGRIJKSTE FIX */}
          <CTA
            primary
            icon={BarChart3}
            title="Ga naar jouw dashboard"
            description="Bekijk jouw organisatie en start analyses vanuit jouw persoonlijke omgeving."
            to="/portal/dashboard"
          />

          <CTA
            icon={FileText}
            title="Analysegeschiedenis"
            description="Bekijk eerdere analyses en rapporten."
            to="/portal/rapporten"
          />

          <CTA
            icon={Crown}
            title="Executive dashboard"
            description="Overzicht van spanningen, alignment en momentum."
            to="/portal/dashboard"
          />
        </section>

        <footer className="pt-10 text-sm text-gray-500 text-center">
          Vertrouwelijk • Geen dataretentie buiten sessie • Bestuursniveau
        </footer>
      </div>
    </div>
  );
}

/* COMPONENTS */

function InfoCard({ icon: Icon, title, text }: any) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F0F0F] p-6">
      <Icon className="text-[#D4AF37] mb-4" size={26} />
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

function CTA({ icon: Icon, title, description, to, primary = false }: any) {
  return (
    <Link
      to={to}
      className={`rounded-2xl p-7 border transition flex flex-col justify-between
        ${primary
          ? "bg-[#D4AF37] text-black border-[#D4AF37]"
          : "bg-[#0F0F0F] border-white/10 text-white"}
      `}
    >
      <div>
        <Icon size={28} className={primary ? "text-black mb-4" : "text-[#D4AF37] mb-4"} />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className={primary ? "text-black/80" : "text-gray-400"}>
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 font-medium">
        Openen <ArrowRight size={16} />
      </div>
    </Link>
  );
}
