import { Link } from "react-router-dom";

const cardClass =
  "marketing-card";

function StickyRail() {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      <div className="marketing-card">
        <p className="text-xs uppercase tracking-[0.14em] text-[#7A5C3E] mb-3">Scan</p>
        <p className="text-sm text-[#3D4650]">Snel inzicht in structuur, keuze en contract.</p>
      </div>
      <div className="marketing-card">
        <h3 className="text-xl font-semibold tracking-tight mb-2">Besloten omgeving</h3>
        <div className="space-y-3">
          <Link to="/portal" className="marketing-btn-primary w-full px-4 py-3 text-sm">Ga naar Portal</Link>
          <Link to="/aurelius/login" className="marketing-btn-secondary w-full px-4 py-3 text-sm">Login</Link>
        </div>
      </div>
    </aside>
  );
}

export default function DemoPage() {
  return (
    <div className="marketing-readable marketing-shell min-h-screen">
      <section className="marketing-container pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-[#7A5C3E] mb-6">Bestuurlijk Besluitdocument</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-6">
              Dit is geen rapport.
              <br />
              Dit is een interventiekader.
            </h1>
            <div className="space-y-1 text-xl text-[#3D4650]">
              <p>Dominante these</p>
              <p>Structurele kernspanning</p>
              <p>Onvermijdelijke keuzes</p>
              <p>De prijs van uitstel</p>
              <p>Mandaat &amp; besluitrecht</p>
              <p>Faalmechanisme</p>
              <p>90-dagen interventieontwerp</p>
              <p>Decision Contract</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <StickyRail />
          </div>
        </div>
      </section>

      <section className="marketing-container pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <article className={cardClass}>
              <p className="text-lg text-[#3D4650]">Geen SWOT-gevoel.</p>
              <p className="text-lg text-[#3D4650]">Geen adviesrapport-taal.</p>
              <p className="text-lg text-[#3D4650]">Wel expliciet verlies, beslisgates en afdwingbaar mandaat.</p>
            </article>

            <article className={cardClass}>
              <div className="flex flex-wrap gap-4">
                <Link to="/portal" className="marketing-btn-secondary px-8 py-4">Ga naar Portal</Link>
                <Link to="/contact" className="marketing-btn-primary px-8 py-4">Plan een Bestuurlijke Intake</Link>
              </div>
            </article>
          </div>
          <div className="lg:hidden">
            <StickyRail />
          </div>
        </div>
      </section>
    </div>
  );
}
