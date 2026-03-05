import { Link } from "react-router-dom";

export default function PricingPage() {
  return (
    <main className="marketing-readable marketing-shell py-16 md:py-20">
      <section className="marketing-container">
        <div className="marketing-card">
          <p className="text-xs uppercase tracking-[0.2em] text-cyntra-gold">Prijzen</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-white">Toegang tot Cyntra</h1>
          <p className="mt-3 max-w-3xl text-cyntra-secondary">
            Kies tussen losse AI-analyses en bestuurlijke interventies afhankelijk van beslisdruk, tempo en implementatiebehoefte.
          </p>
        </div>
      </section>

      <section className="marketing-container mt-6">
        <div className="marketing-card">
          <h2 className="text-2xl font-semibold text-white">AI Analyses</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
          </div>
        </div>
      </section>

      <section className="marketing-container mt-6">
        <div className="marketing-card">
          <h2 className="text-2xl font-semibold text-white">Bestuurlijke Interventies</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-1">
            <article className="marketing-card">
              <p className="text-xs uppercase tracking-[0.16em] text-cyntra-gold">Interventieontwerp</p>
              <p className="mt-2 text-2xl font-semibold text-white">€25k – €45k</p>
              <ul className="mt-3 space-y-1 text-sm text-cyntra-secondary">
                <li>Aurelius diagnose</li>
                <li>15+ interventies</li>
                <li>beslisgates</li>
                <li>decision contract</li>
              </ul>
              <Link to="/contact" className="marketing-btn-primary mt-4 px-5 py-2.5 text-sm">Plan bestuurlijke intake</Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
