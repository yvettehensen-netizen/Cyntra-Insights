import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Cyntra Insights | Bestuurlijke Analyse</title>
        <meta
          name="description"
          content="AI-gedreven strategische analyse voor bestuurders die snelle en expliciete keuzes moeten maken."
        />
        <link rel="canonical" href="https://cyntra-insights.nl/" />
      </Helmet>

      <main className="marketing-readable marketing-shell">
        <section className="marketing-container min-h-[calc(100vh-5rem)] py-5 md:py-7 flex flex-col justify-between gap-4">
          <div className="marketing-card">
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight text-white">
              Bestuurlijke analyse.
              <br />
              Besluitdocument.
              <br />
              Interventie.
            </h1>
            <p className="mt-3 max-w-4xl text-base md:text-lg text-cyntra-secondary">
              AI-gedreven strategische analyse voor bestuurders
              die snelle en expliciete keuzes moeten maken.
            </p>
            <div className="mt-3 space-y-1 text-sm md:text-base text-cyntra-secondary">
              <p>Geen dashboards.</p>
              <p>Geen adviesrapporten.</p>
              <p>Wel dominante theses, kernspanning en onvermijdelijke keuzes.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/scan" className="marketing-btn-primary px-5 py-2.5 text-sm">Start analyse</Link>
              <Link to="/contact" className="marketing-btn-secondary px-5 py-2.5 text-sm">Plan bestuurlijke intake</Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="marketing-card">
              <p className="text-xs uppercase tracking-[0.16em] text-cyntra-gold">Boardroom Analyse</p>
              <p className="mt-2 text-2xl font-semibold text-white">€750</p>
              <ul className="mt-3 space-y-1 text-sm text-cyntra-secondary">
                <li>dominante these</li>
                <li>kernspanning</li>
                <li>strategische opties</li>
                <li>prijs van uitstel</li>
              </ul>
              <Link to="/scan" className="marketing-btn-secondary mt-4 px-4 py-2 text-sm">Start analyse</Link>
            </article>

            <article className="marketing-card">
              <p className="text-xs uppercase tracking-[0.16em] text-cyntra-gold">Strategisch Besluitdocument</p>
              <p className="mt-2 text-2xl font-semibold text-white">€2.500</p>
              <ul className="mt-3 space-y-1 text-sm text-cyntra-secondary">
                <li>dominante these</li>
                <li>structurele kernspanning</li>
                <li>expliciet verlies</li>
                <li>90-dagen interventieplan</li>
              </ul>
              <Link to="/besluitdocument" className="marketing-btn-secondary mt-4 px-4 py-2 text-sm">Genereer besluitdocument</Link>
            </article>

            <article className="marketing-card">
              <p className="text-xs uppercase tracking-[0.16em] text-cyntra-gold">Interventieontwerp</p>
              <p className="mt-2 text-2xl font-semibold text-white">€25k – €45k</p>
              <ul className="mt-3 space-y-1 text-sm text-cyntra-secondary">
                <li>Aurelius diagnose</li>
                <li>15+ interventies</li>
                <li>beslisgates</li>
                <li>decision contract</li>
              </ul>
              <Link to="/contact" className="marketing-btn-secondary mt-4 px-4 py-2 text-sm">Plan bestuurlijke intake</Link>
            </article>
          </div>

          <div className="marketing-card">
            <h2 className="text-2xl font-semibold text-white">Niet elk probleem vraagt een traject.</h2>
            <p className="mt-2 text-cyntra-secondary">Soms is een analyse genoeg. Soms is een interventie nodig.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/scan" className="marketing-btn-primary px-5 py-2.5 text-sm">Start analyse</Link>
              <Link to="/contact" className="marketing-btn-secondary px-5 py-2.5 text-sm">Plan intake</Link>
              <Link to="/portal" className="marketing-btn-secondary px-5 py-2.5 text-sm">Ga naar portal</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
