import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const CTA_ROUTE = "/contact";

const methodSteps = [
  {
    title: "1. Diagnose onder spanning",
    items: ["machtsdynamiek", "besluitstructuur", "onderstroom", "contractpositie"],
  },
  {
    title: "2. Bestuurlijke These",
    items: [
      "Wat staat werkelijk op het spel?",
      "Welke keuze wordt vermeden?",
      "Wie verliest bij besluit?",
    ],
  },
  {
    title: "3. Interventie-ontwerp (90 dagen)",
    items: [
      "6 kerninterventies",
      "eigenaar",
      "deadline",
      "KPI",
      "escalatiepad",
      "direct zichtbaar effect",
    ],
  },
  {
    title: "4. Decision Contract",
    items: [
      "expliciete keuze",
      "geaccepteerd verlies",
      "verschoven besluitrecht",
      "point of no return",
    ],
  },
];

const suitableFor = [
  "Raden van Bestuur",
  "Directieteams",
  "Publieke instellingen",
  "Zorgorganisaties",
  "Scale-ups in groeispanning",
  "Organisaties onder toezicht",
];

const notSuitableFor = [
  "organisaties die conflict willen vermijden",
  "organisaties die bevestiging zoeken",
  "organisaties zonder urgentie",
  "organisaties die geen mandaat willen verschuiven",
];

const outcomes = [
  "Snellere besluitvorming",
  "Duidelijker mandaat",
  "Minder informele bypasses",
  "Hogere uitvoeringsdiscipline",
  "Meetbare 90-dagen voortgang",
  "Minder escalaties zonder eigenaar",
];

export default function BestuurlijkeInterventiepartnerPage() {
  return (
    <>
      <Helmet>
        <title>Bestuurlijke Interventiepartner | Cyntra</title>
        <meta
          name="description"
          content="Cyntra helpt bestuurders onder druk scherpe keuzes te maken: expliciet, uitvoerbaar en onomkeerbaar."
        />
      </Helmet>

      <main className="bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <section className="border-b border-white/10 pb-16 md:pb-20">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Bestuurlijke Interventiepartner</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-6xl">
              Wanneer spanning oploopt, wordt besturen zichtbaar.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/80">
              Cyntra helpt Raden van Bestuur en directies om onder druk scherpe keuzes te maken — expliciet,
              uitvoerbaar en onomkeerbaar.
            </p>
            <div className="mt-10">
              <Link
                to={CTA_ROUTE}
                className="inline-block border border-white px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
              >
                Plan een Bestuurlijke Intake
              </Link>
            </div>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Het probleem dat zelden hardop wordt benoemd</h2>
            <div className="mt-8 space-y-4 text-white/85">
              <p>Uitgestelde besluiten.</p>
              <p>Onuitgesproken machtsconflicten.</p>
              <p>Vermeden verlies.</p>
              <p>Informele bypasses.</p>
              <p>Interventies zonder eigenaar.</p>
              <p>Governance zonder besluitdwang.</p>
            </div>
            <p className="mt-10 whitespace-pre-line text-lg leading-relaxed text-white">
              In de boardroom heet dat nuance.{"\n"}
              In de uitvoering heet dat stagnatie.
            </p>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Wat Cyntra doet</h2>
            <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-white">
              Cyntra is geen adviesbureau.{"\n"}
              Wij zijn een bestuurlijke interventiepartner.
            </p>
            <div className="mt-10 space-y-3 text-white/85">
              <p>Wij maken kernconflicten expliciet.</p>
              <p>Wij benoemen machtsverschuivingen.</p>
              <p>Wij definiëren irreversibele momenten.</p>
              <p>Wij vertalen analyse naar 90-dagen interventie.</p>
              <p>Wij dwingen bestuurlijke commitment af.</p>
            </div>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">De interventiemethode</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {methodSteps.map((step) => (
                <article key={step.title} className="border border-white/15 p-6">
                  <h3 className="text-lg font-medium text-white">{step.title}</h3>
                  <ul className="mt-4 space-y-2 text-white/80">
                    {step.items.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Waarom dit anders is</h2>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="text-sm uppercase tracking-[0.14em] text-white/55">Wij leveren geen</h3>
                <ul className="mt-4 space-y-2 text-white/80">
                  <li>- inspiratiesessies</li>
                  <li>- cultuurtrajecten</li>
                  <li>- visiedocumenten</li>
                  <li>- consensusworkshops</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.14em] text-white/55">Wij leveren</h3>
                <ul className="mt-4 space-y-2 text-white/80">
                  <li>- expliciete keuzes</li>
                  <li>- herverdeling van mandaat</li>
                  <li>- uitvoerbare interventies</li>
                  <li>- meetbare voortgang</li>
                  <li>- onomkeerbare besluiten</li>
                </ul>
              </div>
            </div>
            <p className="mt-12 whitespace-pre-line text-lg leading-relaxed text-white">
              Besturen is geen brainstorm.{"\n"}
              Het is verlies nemen onder tijdsdruk.
            </p>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Voor wie</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="text-sm uppercase tracking-[0.14em] text-white/55">Geschikt voor</h3>
                <ul className="mt-4 space-y-2 text-white/80">
                  {suitableFor.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.14em] text-white/55">Niet geschikt voor</h3>
                <ul className="mt-4 space-y-2 text-white/80">
                  {notSuitableFor.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Resultaten</h2>
            <ul className="mt-8 space-y-3 text-white/85">
              {outcomes.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/55">Geen cijfers zonder casuscontext.</p>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Vertrouwelijkheid</h2>
            <ul className="mt-8 space-y-3 text-white/85">
              <li>- Geen generieke output.</li>
              <li>- Geen externe datatraining.</li>
              <li>- Casus-gebonden analyse.</li>
              <li>- Volledige vertrouwelijkheid.</li>
            </ul>
            <p className="mt-10 text-lg leading-relaxed text-white">
              Wij werken in de bestuurlijke realiteit.
              <br />
              Niet in marketingtaal.
            </p>
          </section>

          <section className="border-b border-white/10 py-16 md:py-20">
            <h2 className="text-2xl font-medium md:text-3xl">Samenwerkingsvormen</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <article className="border border-white/15 p-6">
                <h3 className="text-lg font-medium">Bestuurlijke Scan</h3>
                <p className="mt-4 text-white/80">Eenmalige diagnose + interventieontwerp.</p>
              </article>
              <article className="border border-white/15 p-6">
                <h3 className="text-lg font-medium">90-Dagen Interventietraject</h3>
                <p className="mt-4 text-white/80">Begeleide implementatie + maandelijkse herijking.</p>
              </article>
              <article className="border border-white/15 p-6">
                <h3 className="text-lg font-medium">Doorlopende Bestuurlijke Partner</h3>
                <p className="mt-4 text-white/80">Structurele sparring + escalatie-analyse + interventie-onderhoud.</p>
              </article>
            </div>
          </section>

          <section className="border-b border-white/10 py-16 md:py-24">
            <h2 className="text-sm uppercase tracking-[0.14em] text-white/55">Founder stem</h2>
            <blockquote className="mt-8 max-w-4xl whitespace-pre-line text-2xl font-light leading-relaxed md:text-3xl">
              “Bestuurders falen zelden door gebrek aan intelligentie.
              Ze falen door het uitstellen van verlies.
              Cyntra helpt om dat verlies expliciet te maken — zodat vooruitgang mogelijk wordt.”
            </blockquote>
          </section>

          <section className="pt-16 md:pt-20">
            <h2 className="text-2xl font-medium md:text-3xl">Plan een Bestuurlijke Intake</h2>
            <p className="mt-4 text-white/75">Geen vrijblijvende kennismaking. Wel een scherpe diagnose.</p>
            <div className="mt-8">
              <Link
                to={CTA_ROUTE}
                className="inline-block border border-white px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
              >
                Plan een Bestuurlijke Intake
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
