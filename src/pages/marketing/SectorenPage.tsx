import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const sectors = [
  {
    title: "Zorg",
    body: "Tariefdruk, capaciteit, wachttijd en contractplafonds dwingen scherpe keuzes over uitvoerbaarheid en portfolio.",
    cta: { label: "Plan intake", to: "/contact" },
  },
  {
    title: "Scale-ups",
    body: "Groei zonder besluitdiscipline leidt tot scope-creep, operationele breuk en druk op retentie en levering.",
    cta: { label: "Start korte scan", to: "/scan" },
  },
  {
    title: "Overheid en publiek",
    body: "Mandaat, ketenafstemming en uitvoerbaarheid vragen expliciete governance en heldere besluitgates.",
    cta: { label: "Plan intake", to: "/contact" },
  },
];

export default function SectorenPage() {
  return (
    <>
      <Helmet>
        <title>Sectoren | Cyntra Insights</title>
        <meta
          name="description"
          content="Cyntra werkt in sectoren waar besluitdruk, uitvoeringscomplexiteit en verantwoordingslast samenkomen."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell overflow-hidden text-white">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.18),_transparent_28%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] py-24 md:py-32">
          <div className="marketing-container">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Sectoren
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                Waar Cyntra bestuurlijke frictie zichtbaar maakt.
              </h1>
              <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#D6DEE5]">
                Cyntra werkt in sectoren waar besluitdruk, uitvoeringscomplexiteit en
                verantwoordingslast samenkomen en waar expliciete keuzes niet langer
                uitgesteld kunnen worden.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="grid gap-6 md:grid-cols-3">
              {sectors.map((sector) => (
                <article key={sector.title} className="marketing-card rounded-[28px] p-8">
                  <h2 className="text-2xl font-semibold text-white">{sector.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                    {sector.body}
                  </p>
                  <Link to={sector.cta.to} className="marketing-btn-secondary mt-8 px-6 py-3 text-sm">
                    {sector.cta.label}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.028),_rgba(255,255,255,0.012))] py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Publieke vervolgstap
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Eerst een kort signaal. Daarna pas de volledige rapportlaag.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6DEE5]">
                De publieke route start met een scan of intake. Het volledige
                boardroomrapport open je daarna via de gesloten Aurelius login.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                Start korte scan
              </Link>
              <Link to="/aurelius/login" className="marketing-btn-secondary px-8 py-4 text-base">
                Login volledig rapport
              </Link>
              <Link to="/aurelius" className="marketing-btn-secondary px-8 py-4 text-base">
                Bekijk Aurelius
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
