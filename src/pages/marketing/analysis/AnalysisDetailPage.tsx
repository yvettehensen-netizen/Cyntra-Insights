import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const cardClass =
  "border border-[#D9D2C6] bg-white p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-24px_rgba(31,35,40,0.45)] hover:-translate-y-0.5";

export default function AnalysisDetailPage() {
  const [activeTab, setActiveTab] = useState<"intelligence" | "decision">(
    "intelligence"
  );

  return (
    <>
      <Helmet>
        <title>Analysevelden | Cyntra</title>
      </Helmet>
      <main className="marketing-readable min-h-screen bg-[#F5F3EE] text-[#1F2328]">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">Analysevelden</h1>
              <p className="mt-6 text-xl text-[#3D4650] max-w-3xl leading-relaxed">
                Elk veld wordt alleen gebruikt om de bestuurlijke interventie te verscherpen.
              </p>
            </div>
            <aside className="lg:sticky lg:top-24">
              <div className="border border-[#7A5C3E]/45 bg-[#FAF8F3] p-6">
                <h3 className="text-xl font-semibold tracking-tight mb-2">Besloten omgeving</h3>
                <div className="space-y-3">
                  <Link to="/portal" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-[#7A5C3E] text-white text-sm font-medium hover:bg-[#6A4F35] transition-colors">Ga naar Portal</Link>
                  <Link to="/aurelius/login" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#7A5C3E] text-[#7A5C3E] text-sm font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Login</Link>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="mb-8 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("intelligence")}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                activeTab === "intelligence"
                  ? "border-[#D4AF37]/70 bg-[#1a1408] text-[#F6DD93]"
                  : "border-white/20 bg-[#1a2030] text-[#A8AFBD]"
              }`}
            >
              Intelligence
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("decision")}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                activeTab === "decision"
                  ? "border-[#D4AF37]/70 bg-[#1a1408] text-[#F6DD93]"
                  : "border-white/20 bg-[#1a2030] text-[#A8AFBD]"
              }`}
            >
              Board Decision
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              {activeTab === "intelligence" ? (
                <>
                  <div className={cardClass}>
                    <h2 className="text-2xl font-semibold text-[#1F2328] mb-4">Strategische spanning</h2>
                    <p className="text-[#3D4650]">Strategie, groei, markt, positionering</p>
                  </div>
                  <div className={cardClass}>
                    <h2 className="text-2xl font-semibold text-[#1F2328] mb-4">Besluitfrictie</h2>
                    <p className="text-[#3D4650]">Cultuur, team, leiderschap, onderstroom</p>
                  </div>
                  <div className={cardClass}>
                    <h2 className="text-2xl font-semibold text-[#1F2328] mb-4">Executiediscipline</h2>
                    <p className="text-[#3D4650]">Proces, financiën, governance, risico</p>
                  </div>
                  <div className={cardClass}>
                    <h2 className="text-2xl font-semibold text-[#1F2328] mb-4">Synthese</h2>
                    <p className="text-[#3D4650]">Eén besluitlijn met contracteerbare consequenties</p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#1A1F2C] p-8 max-w-[760px]">
                  <h2 className="text-2xl font-semibold text-[#F6DD93] mb-4">Board Decision (1 pagina)</h2>
                  <p className="text-[#EDEDED] leading-relaxed">
                    Compacte beslisstructuur met keuze vandaag, 3 opties, expliciet verlies, stop-doing,
                    30/60/90 gates en handtekeningdiscipline.
                  </p>
                  <Link
                    to="/portal"
                    className="mt-6 inline-flex items-center justify-center rounded-md border border-[#D4AF37]/50 bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0F172A]"
                  >
                    Download Board Memo (PDF-ready)
                  </Link>
                </div>
              )}

              <div className={cardClass}>
                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#7A5C3E] text-white font-medium hover:bg-[#6A4F35] transition-colors">Plan een Bestuurlijke Intake</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
