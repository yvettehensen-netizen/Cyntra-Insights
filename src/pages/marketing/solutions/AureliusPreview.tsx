import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const cardClass =
  "border border-[#D9D2C6] bg-white p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-24px_rgba(31,35,40,0.45)] hover:-translate-y-0.5";

function StickyRail() {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      <div className="border border-[#7A5C3E]/35 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[#7A5C3E] mb-3">Wat Aurelius afdwingt</p>
        <div className="space-y-2 text-sm text-[#3D4650]">
          <p>Beslisgates 30 / 60 / 90</p>
          <p>Mandaatverschuiving</p>
          <p>Onomkeerbaarheid</p>
        </div>
      </div>

      <div className="border border-[#7A5C3E]/45 bg-[#FAF8F3] p-6">
        <h3 className="text-xl font-semibold tracking-tight mb-2">Besloten omgeving</h3>
        <p className="text-sm text-[#3D4650] mb-5">Toegang voor bestuur en adviseurs met mandaat.</p>
        <div className="space-y-3">
          <Link to="/portal" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-[#7A5C3E] text-white text-sm font-medium hover:bg-[#6A4F35] transition-colors">Ga naar Portal</Link>
          <Link to="/aurelius/login" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#7A5C3E] text-[#7A5C3E] text-sm font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </aside>
  );
}

export default function AureliusPreview() {
  return (
    <>
      <Helmet>
        <title>Aurelius | Besluitomgeving voor bestuur onder spanning</title>
        <meta
          name="description"
          content="Aurelius is de besloten besluitomgeving waarin interventies worden ontworpen en afgedwongen."
        />
      </Helmet>

      <div className="marketing-readable bg-[#F5F3EE] text-[#1F2328] min-h-screen">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-18">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-[#7A5C3E] mb-6">Aurelius</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-6">Aurelius</h1>
              <p className="text-2xl leading-tight mb-6">Besluitomgeving voor bestuur onder spanning.</p>

              <p className="text-lg text-[#3D4650]">Geen dashboards.</p>
              <p className="text-lg text-[#3D4650]">Geen consensus.</p>
              <p className="text-lg text-[#3D4650]">Geen managementtaal.</p>

              <p className="mt-6 text-xl text-[#3D4650] leading-relaxed max-w-3xl">
                Aurelius maakt zichtbaar waar besluitvorming vastloopt
                en structureert interventies die niet teruggedraaid worden.
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
                <h2 className="text-3xl font-semibold tracking-tight">Wat Aurelius structureert</h2>
                <div className="mt-6 space-y-2 text-lg text-[#3D4650]">
                  <p>Diagnose van bestuurlijke frictie</p>
                  <p>Expliciete keuzes</p>
                  <p>Beslisgates (30 / 60 / 90 dagen)</p>
                  <p>Mandaatverschuiving</p>
                  <p>90-dagen interventieontwerp</p>
                  <p>Decision Contract</p>
                </div>
              </article>

              <article className={cardClass}>
                <h2 className="text-3xl font-semibold tracking-tight">Wat het niet doet</h2>
                <div className="mt-6 space-y-2 text-lg text-[#3D4650]">
                  <p>Geen voorspellingen</p>
                  <p>Geen advies op middenniveau</p>
                  <p>Geen rapportexport als eindpunt</p>
                </div>
                <p className="mt-6 text-xl">Het is een besluitdiscipline-instrument.</p>
              </article>

              <article className={cardClass}>
                <p className="text-sm uppercase tracking-[0.16em] text-[#7A5C3E] mb-3">Technische architectuur</p>
                <p className="text-[#3D4650] leading-relaxed max-w-4xl">
                  Besloten toegang, scheiding van besluitcontext, auditbare interventielogica en structurele governanceborging.
                </p>

                <div className="mt-8">
                  <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#7A5C3E] text-white font-medium hover:bg-[#6A4F35] transition-colors">Plan een Bestuurlijke Intake</Link>
                </div>
              </article>
            </div>

            <div className="lg:hidden">
              <StickyRail />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
