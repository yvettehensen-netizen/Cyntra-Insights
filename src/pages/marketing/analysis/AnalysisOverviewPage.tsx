import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const cardClass =
  "border border-[#D9D2C6] bg-white p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-24px_rgba(31,35,40,0.45)] hover:-translate-y-0.5";

function StickyRail() {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      <div className="border border-[#7A5C3E]/35 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[#7A5C3E] mb-3">Interventielogica</p>
        <div className="space-y-2 text-sm text-[#3D4650]">
          <p>Spanning</p><p>Diagnose</p><p>Keuze</p><p>Contract</p>
        </div>
      </div>
      <div className="border border-[#7A5C3E]/45 bg-[#FAF8F3] p-6">
        <h3 className="text-xl font-semibold tracking-tight mb-2">Besloten omgeving</h3>
        <div className="space-y-3">
          <Link to="/portal" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-[#7A5C3E] text-white text-sm font-medium hover:bg-[#6A4F35] transition-colors">Ga naar Portal</Link>
          <Link to="/aurelius/login" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#7A5C3E] text-[#7A5C3E] text-sm font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </aside>
  );
}

export default function AnalysisOverviewPage() {
  return (
    <>
      <Helmet>
        <title>Diagnose onder spanning | Cyntra</title>
      </Helmet>
      <div className="marketing-readable bg-[#F5F3EE] text-[#1F2328] min-h-screen">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">Diagnose onder spanning</h1>
              <p className="mt-6 text-xl text-[#3D4650] max-w-3xl leading-relaxed">
                Geen analysecatalogus als doel. Wel interventiestructuur die bestuurlijke keuze afdwingt.
              </p>
            </div>
            <div className="hidden lg:block"><StickyRail /></div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <article className={cardClass}>
                <div className="space-y-2 text-lg text-[#3D4650]">
                  <p>Dominante These</p>
                  <p>Structurele Kernspanning</p>
                  <p>Onvermijdelijke Keuzes</p>
                  <p>De Prijs van Uitstel</p>
                  <p>Mandaat & Besluitrecht</p>
                  <p>Onderstroom & Informele Macht</p>
                  <p>Faalmechanisme</p>
                  <p>90-Dagen Interventieontwerp</p>
                  <p>Decision Contract</p>
                </div>
              </article>
              <article className={cardClass}>
                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#7A5C3E] text-white font-medium hover:bg-[#6A4F35] transition-colors">Plan een Bestuurlijke Intake</Link>
              </article>
            </div>
            <div className="lg:hidden"><StickyRail /></div>
          </div>
        </section>
      </div>
    </>
  );
}
