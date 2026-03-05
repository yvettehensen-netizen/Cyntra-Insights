import { Link } from "react-router-dom";

const cardClass =
  "border border-[#D9D2C6] bg-white p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-24px_rgba(31,35,40,0.45)] hover:-translate-y-0.5";

function StickyRail() {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      <div className="border border-[#7A5C3E]/35 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[#7A5C3E] mb-3">Beslisgates</p>
        <div className="space-y-3 text-sm text-[#3D4650]">
          <p><strong>30 dagen</strong> — expliciete keuze</p>
          <p><strong>60 dagen</strong> — mandaatverschuiving</p>
          <p><strong>90 dagen</strong> — onomkeerbaarheid</p>
        </div>
      </div>

      <div className="border border-[#7A5C3E]/45 bg-[#FAF8F3] p-6">
        <h3 className="text-xl font-semibold tracking-tight mb-2">Besloten omgeving</h3>
        <p className="text-sm text-[#3D4650] mb-5">Toegang voor bestuur en adviseurs met mandaat.</p>
        <div className="space-y-3">
          <Link to="/contact" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#D9D2C6] bg-white text-[#1F2328] text-sm font-medium hover:bg-[#F0ECE4] transition-colors">Plan een Bestuurlijke Intake</Link>
          <Link to="/portal" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-[#7A5C3E] text-white text-sm font-medium hover:bg-[#6A4F35] transition-colors">Ga naar Portal</Link>
          <Link to="/aurelius/login" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#7A5C3E] text-[#7A5C3E] text-sm font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </aside>
  );
}

export default function ZorgScanPreviewPage() {
  return (
    <div className="marketing-readable bg-[#F5F3EE] text-[#1F2328] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-[#7A5C3E] mb-8">Zorg</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-6">
              ZorgScan
              <br />
              Besluitdiscipline bij structurele zorgspanning
            </h1>
            <p className="text-xl text-[#3D4650] max-w-3xl leading-relaxed">
              Parallelle agenda’s, capaciteitsdruk en diffuus besluitrecht worden bestuurlijk expliciet gemaakt.
            </p>
          </div>
          <div className="hidden lg:block">
            <StickyRail />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <article className={cardClass}>
              <h2 className="text-3xl font-semibold tracking-tight">Structuur</h2>
              <div className="mt-5 space-y-2 text-lg text-[#3D4650]">
                <p>1. Spanning</p>
                <p>2. Diagnose</p>
                <p>3. Onvermijdelijke keuze</p>
                <p>4. Interventiediscipline</p>
                <p>5. Besloten omgeving</p>
                <p>6. Decision Contract</p>
                <p>7. Voor wie / Niet geschikt voor</p>
                <p>8. Call to action</p>
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
