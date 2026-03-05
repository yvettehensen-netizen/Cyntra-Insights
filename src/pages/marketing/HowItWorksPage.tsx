import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  return (
    <main className="marketing-readable marketing-shell py-24 md:py-32">
      <section className="marketing-container text-center">
        <p className="text-sm uppercase tracking-[0.18em] mb-6">Hoe Cyntra werkt</p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] mb-8">
          Geen traject.
          <br />
          Een bestuurlijke ingreep.
        </h1>
        <p className="mx-auto text-xl md:text-2xl text-[#b8c2d4] max-w-4xl">
          Compact, expliciet en onomkeerbaar. Bestuurders scannen, dus elke stap is ontworpen voor snelle besluitvorming.
        </p>
      </section>

      <section className="marketing-container mt-16 md:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <article className="marketing-card">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Wat zichtbaar wordt</h2>
            <div className="space-y-4 text-lg md:text-xl">
              <p>Dominante bestuurlijke these</p>
              <p>Structurele kernspanning en verlies</p>
              <p>Mandaatverschuiving en gates</p>
              <p>Decision Contract</p>
            </div>
          </article>

          <article className="marketing-card">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Beslisgates</h2>
            <div className="space-y-4 text-lg md:text-xl">
              <p>Dag 30: expliciete keuze</p>
              <p>Dag 60: mandaatverschuiving</p>
              <p>Dag 90: onomkeerbaarheid</p>
            </div>
          </article>
        </div>

        <div className="mt-14 md:mt-16 flex flex-wrap justify-center gap-4">
          <Link to="/portal" className="marketing-btn-primary px-8 py-4 text-lg md:text-xl">
            Ga naar Portal
          </Link>
          <Link to="/contact" className="marketing-btn-secondary px-8 py-4 text-lg md:text-xl">
            Plan Bestuurlijke Intake
          </Link>
        </div>
      </section>
    </main>
  );
}
