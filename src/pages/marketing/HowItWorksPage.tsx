import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const processSteps = [
  {
    title: "1. Diagnose",
    body: "Cyntra haalt uit gesprekken, documenten en context de bestuurlijke these en kernspanning die nu nog impliciet blijft.",
  },
  {
    title: "2. Keuze",
    body: "De analyse wordt teruggebracht tot scenario's, expliciet verlies en een besluitlijn waar bestuurders echt ja of nee op kunnen zeggen.",
  },
  {
    title: "3. Interventie",
    body: "Daarna volgt een boardroomdossier met stopregels, acties en een duidelijke vervolgroute voor uitvoering en governance.",
  },
];

const visibleItems = [
  "dominante bestuurlijke these",
  "structurele kernspanning",
  "scenariovergelijking",
  "bestuurlijke acties",
];

const gateItems = [
  "dag 30: expliciete keuze",
  "dag 60: mandaatverschuiving",
  "dag 90: herijking of onomkeerbaarheid",
];

const principles = [
  {
    title: "Besluit boven analyse",
    body: "Cyntra bouwt geen rapport om het rapport. Het bouwt een besluitstructuur waar bestuurders direct mee kunnen werken.",
  },
  {
    title: "Mechanisme boven symptoom",
    body: "De analyse stopt niet bij observatie, maar legt bloot welk systeem druk op uitvoering, marge of governance veroorzaakt.",
  },
  {
    title: "Ritme boven ruis",
    body: "Elke analyse eindigt in een concrete volgorde: wat nu zichtbaar wordt, welke keuze nodig is en wat het bestuur daarna moet doen.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>Hoe Cyntra werkt | Strategische bestuurspartner</title>
        <meta
          name="description"
          content="Cyntra vertaalt strategische analyse naar expliciete bestuurlijke keuzes, scenario's en interventies."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell overflow-hidden text-white">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.2),_transparent_28%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] py-24 md:py-32">
          <div className="marketing-container">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                  Hoe Cyntra werkt
                </p>
                <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                  Geen traject.
                  <br />
                  Een bestuurlijke ingreep.
                </h1>
                <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#D6DEE5] md:text-2xl">
                  Cyntra brengt strategische spanning terug tot een expliciete keuze,
                  een boardroomdossier en een vervolgritme voor bestuur.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                    Start korte scan
                  </Link>
                  <Link to="/aurelius" className="marketing-btn-secondary px-8 py-4 text-base">
                    Bekijk Aurelius
                  </Link>
                  <Link to="/aurelius/login" className="marketing-btn-secondary px-8 py-4 text-base">
                    Login volledig rapport
                  </Link>
                </div>
              </div>

              <div className="marketing-card rounded-[32px] p-8 md:p-10">
                <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">
                  Boardroom flow
                </p>
                <div className="mt-8 space-y-4">
                  {processSteps.map((step) => (
                    <div key={step.title} className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                      <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                      <p className="mt-3 text-base leading-relaxed text-[#D6DEE5]">
                        {step.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Wat zichtbaar wordt
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                De analyse wordt teruggebracht tot bestuurlijke duidelijkheid.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article className="marketing-card rounded-[28px] p-8">
                <h3 className="text-2xl font-semibold text-white">Wat zichtbaar wordt</h3>
                <div className="mt-6 space-y-4 text-lg text-[#D6DEE5]">
                  {visibleItems.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </article>

              <article className="marketing-card rounded-[28px] p-8">
                <h3 className="text-2xl font-semibold text-white">Bestuurlijke gates</h3>
                <div className="mt-6 space-y-4 text-lg text-[#D6DEE5]">
                  {gateItems.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.028),_rgba(255,255,255,0.012))] py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Werkprincipes
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Hoe Cyntra analyse vertaalt naar bestuur.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {principles.map((item) => (
                <article key={item.title} className="marketing-card rounded-[28px] p-8">
                  <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,42,68,0.78),_rgba(10,19,31,0.96))] px-8 py-12 text-white md:px-12">
              <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
                Volgende stap
              </p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
                Eerst een kort signaal. Daarna pas het volledige rapport.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6DEE5]">
                De publieke flow begint met een korte diagnose. Voor het volledige
                boardroomrapport en de gesloten omgeving log je daarna in op Aurelius.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                  Start korte scan
                </Link>
                <Link to="/contact" className="marketing-btn-secondary px-8 py-4 text-base">
                  Plan Bestuurlijke Intake
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
