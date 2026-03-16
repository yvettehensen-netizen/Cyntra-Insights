import { Link } from "react-router-dom";

export default function SectorenPage() {
  return (
    <main className="marketing-readable marketing-shell py-20 md:py-24">
      <section className="marketing-container">
        <div className="marketing-card">
          <p className="text-xs uppercase tracking-[0.2em] text-cyntra-gold">Sectoren</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-white">Waar Cyntra bestuurlijke frictie blootlegt</h1>
          <p className="mt-4 max-w-3xl text-cyntra-secondary">
            Cyntra werkt in sectoren waar besluitdruk, uitvoeringscomplexiteit en verantwoordingslast samenkomen.
          </p>
        </div>
      </section>

      <section className="marketing-container mt-6">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="marketing-card">
            <h2 className="text-2xl font-semibold text-white">Zorg</h2>
            <p className="mt-3 text-cyntra-secondary">Tariefdruk, capaciteit en contractplafonds dwingen scherpe volgordekeuzes.</p>
            <Link to="/contact" className="marketing-btn-secondary mt-5 px-4 py-2 text-sm">Plan intake</Link>
          </article>
          <article className="marketing-card">
            <h2 className="text-2xl font-semibold text-white">Scale-ups</h2>
            <p className="mt-3 text-cyntra-secondary">Groei zonder besluitdiscipline leidt tot scope-creep en margedruk.</p>
            <Link to="/scan" className="marketing-btn-secondary mt-5 px-4 py-2 text-sm">Start scan</Link>
          </article>
          <article className="marketing-card">
            <h2 className="text-2xl font-semibold text-white">Overheid</h2>
            <p className="mt-3 text-cyntra-secondary">Mandaat, ketenafstemming en uitvoerbaarheid vragen expliciete besluitgates.</p>
            <Link to="/contact" className="marketing-btn-secondary mt-5 px-4 py-2 text-sm">Plan intake</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
