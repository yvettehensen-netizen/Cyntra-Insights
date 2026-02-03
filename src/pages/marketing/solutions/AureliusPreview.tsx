import { Link } from "react-router-dom";
import { Lock, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AureliusPreview() {
  return (
    <>
      <Helmet>
        <title>Aurelius Decision Engine | Cyntra Insights</title>
        <meta
          name="description"
          content="Aurelius is de besloten strategische besluitomgeving van Cyntra. Ontworpen voor directies, boards en strategische adviseurs."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative bg-gradient-to-br from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
        {/* Subtiele glow */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -top-80 -right-80 w-[1000px] h-[1000px] bg-[#8B1538]/15 rounded-full blur-[320px]" />
          <div className="absolute -bottom-80 -left-80 w-[1000px] h-[1000px] bg-[#D4AF37]/12 rounded-full blur-[320px]" />
        </div>

        {/* ================= HERO ================= */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-12">
            <Lock size={22} className="text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#D4AF37] tracking-widest">
              BESLOTEN OMGEVING
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-10">
            Aurelius{" "}
            <span className="text-[#D4AF37] block">
              Decision Engine™
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
            Geen dashboards. Geen managementtaal. Geen consensus.
            <br />
            Aurelius toont waar besluitvorming structureel vastloopt —
            en welke keuzes onvermijdelijk zijn.
          </p>

          <div className="flex justify-center gap-14 mb-16 text-gray-400">
            <TrustItem icon={<ShieldCheck size={28} />} label="End-to-end beveiligd" />
            <TrustItem icon={<Zap size={28} />} label="EU-gehost" />
            <TrustItem icon={<Users size={28} />} label="Alleen op uitnodiging" />
          </div>

          <Link
            to="/aurelius/login"
            className="inline-flex items-center gap-6 px-20 py-7 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xl hover:brightness-110 transition"
          >
            Ga naar besloten omgeving
            <ArrowRight size={28} />
          </Link>
        </section>

        {/* ================= OVERVIEW ================= */}
        <section className="relative z-10 py-24 bg-black/45">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
            {/* LINKS */}
            <div>
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-8">
                Wat Aurelius is
              </h3>

              <div className="space-y-6">
                {[
                  {
                    title: "Geen KPI-fetisj",
                    text: "Focus op structurele spanningen in plaats van cosmetische prestaties.",
                  },
                  {
                    title: "Geen groepsdenken",
                    text: "Analyse zonder consensus-bias of politieke correctheid.",
                  },
                  {
                    title: "Geen optimalisatie",
                    text: "Niet verbeteren wat kapot is — maar benoemen wat onhoudbaar is.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-black/40 border border-white/10 rounded-2xl p-8"
                  >
                    <h4 className="text-lg font-bold text-[#D4AF37] mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECHTS */}
            <div>
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-8">
                Voor wie & governance
              </h3>

              <div className="space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-8">
                  <h4 className="text-lg font-bold text-[#D4AF37] mb-4">
                    Voor wie
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-base">
                    <li>• Directies die realiteit verkiezen boven comfort</li>
                    <li>• Raden van Commissarissen die blindspots willen blootleggen</li>
                    <li>• Strategische adviseurs zonder politiek mandaat</li>
                  </ul>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-8">
                  <h4 className="text-lg font-bold text-[#D4AF37] mb-4">
                    Governance
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-base">
                    <li>• Geen training op klantdata</li>
                    <li>• Volledig EU-gehost</li>
                    <li>• Tijdelijke analysecontext</li>
                    <li>• Bestuursniveau vertrouwelijkheid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="relative z-10 py-24 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-10">
            Toegang tot Aurelius is beperkt
          </h2>

          <Link
            to="/aurelius/login"
            className="inline-flex items-center gap-6 px-20 py-7 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xl hover:brightness-110 transition"
          >
            Start Aurelius
            <ArrowRight size={26} />
          </Link>

          <p className="mt-10 text-sm text-gray-500 flex items-center justify-center gap-3">
            <Lock size={16} />
            Volledig vertrouwelijk • Geen KPI’s • Geen ruis
          </p>

          <Link
            to="/"
            className="block mt-8 text-gray-400 hover:text-white transition text-sm"
          >
            ← Terug naar homepage
          </Link>
        </section>
      </div>
    </>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="text-center">
      {icon}
      <p className="mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

