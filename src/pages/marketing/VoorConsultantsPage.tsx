import { Link } from "react-router-dom";

export default function VoorConsultantsPage() {
  return (
    <main className="marketing-readable marketing-shell py-24 md:py-32">
      <section className="marketing-container text-center">
        <p className="text-sm uppercase tracking-[0.18em] mb-6">Voor adviseurs</p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.04] mb-8">
          Niet iedereen past bij Cyntra.
        </h1>
        <p className="mx-auto text-xl md:text-2xl text-[#b8c2d4] max-w-4xl">
          Alleen voor interventiegedreven adviseurs die besluitvorming afdwingen onder druk.
        </p>
      </section>

      <section className="marketing-container mt-16 md:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <article className="marketing-card">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Mandaatgedreven</h2>
            <div className="space-y-4 text-lg md:text-xl">
              <p>Bestuurlijke scherpte</p>
              <p>Financiële discipline</p>
              <p>Escalatiecomfort</p>
            </div>
          </article>

          <article className="marketing-card">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Niet geschikt voor</h2>
            <div className="space-y-4 text-lg md:text-xl">
              <p>Comfortconsultancy</p>
              <p>Culturele warmte zonder besluitkracht</p>
            </div>
          </article>
        </div>

        <div className="mt-14 md:mt-16 flex flex-wrap justify-center gap-4">
          <Link to="/portal" className="marketing-btn-primary px-8 py-4 text-lg md:text-xl">
            Ga naar Portal
          </Link>
          <Link to="/aurelius/login" className="marketing-btn-secondary px-8 py-4 text-lg md:text-xl">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
