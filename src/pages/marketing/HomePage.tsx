// src/pages/marketing/HomePage.tsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Cyntra Insights – Besluitvorming zichtbaar maken</title>
        <meta
          name="description"
          content="Cyntra maakt structurele besluitfrictie zichtbaar. Geen dashboards, geen ruis — alleen strategisch inzicht voor directie en board."
        />
        <link rel="canonical" href="https://cyntra-insights.nl/" />
      </Helmet>

      <div className="relative overflow-hidden bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white">
        {/* ================= BACKGROUND GLOW ================= */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-[#D4AF37]/15 rounded-full blur-[280px]" />
          <div className="absolute bottom-[-400px] right-[-300px] w-[1000px] h-[1000px] bg-[#8B1538]/15 rounded-full blur-[320px]" />
        </div>

        {/* ======================================================
            HERO — POSITIONERING
        ====================================================== */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-44 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-12">
            <Lock size={20} className="text-[#D4AF37]" />
            <span className="text-sm tracking-widest font-semibold text-[#D4AF37]">
              BESLOTEN BOARDROOM INFRASTRUCTUUR
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-10">
            Besluitvorming faalt
            <br />
            <span className="text-[#D4AF37] drop-shadow-[0_0_70px_rgba(212,175,55,0.8)]">
              voordat cijfers dat doen.
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-14 leading-relaxed">
            Cyntra is geen dashboard en geen AI-rapport.
            <br />
            Het is een strategisch besliskader dat blootlegt
            <span className="text-white"> waar organisaties structureel vastlopen</span>
            — in eigenaarschap, governance en besluitstructuur.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Link
              to="/zorgscan"
              className="inline-flex items-center gap-5 px-16 py-7 rounded-3xl bg-[#D4AF37] text-black font-bold text-xl hover:scale-105 transition"
            >
              Start ZorgScan™
              <ArrowRight size={26} />
            </Link>

            <Link
              to="/prijzen"
              className="px-16 py-7 rounded-3xl border border-white/30 text-white text-xl hover:bg-white/10 transition"
            >
              Bekijk toegang
            </Link>

            <Link
              to="/aurelius"
              className="px-16 py-7 rounded-3xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xl border border-[#D4AF37]/40 hover:scale-105 transition"
            >
              Aurelius Portal
            </Link>
          </div>
        </section>

        {/* ======================================================
            POSITIONERING — WAT CYNTRA IS
        ====================================================== */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-40 text-center">
          <h2 className="text-4xl font-bold mb-10">
            Niet nog een dashboard
          </h2>

          <p className="text-xl text-gray-300 leading-relaxed">
            Organisaties falen zelden door gebrek aan data.
            <br />
            Ze falen doordat besluiten blijven hangen in
            <span className="text-white"> onzichtbare spanningen</span>:
            macht zonder eigenaarschap, consensus zonder richting,
            en governance zonder besliskracht.
            <br /><br />
            Cyntra maakt dat zichtbaar — vóórdat het onomkeerbaar wordt.
          </p>
        </section>

        {/* ======================================================
            SCANS — DECISION MAPS BY SECTOR
        ====================================================== */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-48">
          <h2 className="text-4xl font-bold text-center mb-6">
            Besluitvormingsscans
          </h2>

          <p className="text-center text-gray-300 max-w-3xl mx-auto mb-16 leading-relaxed">
            Besluitvorming faalt niet per sector.
            <br />
            Het faalt per structuur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScanCard
              title="ZorgScan™"
              sector="Zorg & GGZ"
              description="Waar governance besluitvorming structureel laat verdampen."
              href="/zorgscan"
              active
            />

            <ScanCard
              title="Scale-up Scan™"
              sector="Start-ups & Scale-ups"
              description="Waar groei stokt door onduidelijk eigenaarschap."
            />

            <ScanCard
              title="BoardScan™"
              sector="Corporates"
              description="Waar consensus verantwoordelijkheid vernietigt."
            />

            <ScanCard
              title="FamilieScan™"
              sector="Familiebedrijven"
              description="Waar loyaliteit beslissingen vervangt."
            />
          </div>
        </section>
      </div>
    </>
  );
}

/* ======================================================
   SCAN CARD — PRESENTATION ONLY
====================================================== */

function ScanCard({
  title,
  sector,
  description,
  href,
  active,
}: {
  title: string;
  sector: string;
  description: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={`rounded-3xl border p-8 h-full transition ${
        active
          ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:scale-[1.03]"
          : "border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-white/30 mb-2">
        {sector}
      </p>

      <h3 className="text-xl font-semibold text-[#D4AF37] mb-3">
        {title}
      </h3>

      <p className="text-white/50 leading-relaxed text-sm">
        {description}
      </p>

      {active && (
        <div className="mt-6 text-[#D4AF37] text-sm font-semibold">
          Start scan →
        </div>
      )}
    </div>
  );

  if (active && href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
