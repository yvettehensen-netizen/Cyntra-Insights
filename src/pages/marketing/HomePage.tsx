import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const audienceItems = [
  "zorginstellingen",
  "bestuurders en directies",
  "adviesbureaus",
  "investeerders",
  "publieke organisaties",
];

const uploadItems = [
  "een gesprek",
  "een rapport",
  "een beleidsdocument",
  "een interview",
];

const analysisItems = [
  "strategische patronen",
  "conflicten",
  "risico's",
  "mogelijke interventies",
];

const reportItems = [
  "killer insights",
  "strategische keuzes",
  "interventievoorstellen",
  "open vragen voor bestuur",
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Aurelius | Boardroom Intelligence</title>
        <meta
          name="description"
          content="Aurelius laat boardrooms hun echte probleem zien met killer insights, strategische keuzes en concrete interventies."
        />
        <link rel="canonical" href="https://cyntra-insights.nl/" />
      </Helmet>

      <main id="top" className="marketing-readable marketing-shell text-white">
        <section
          id="aurelius"
          className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.22),_transparent_32%),linear-gradient(135deg,_#0F2A44_0%,_#16344F_55%,_#0B2134_100%)] text-white"
        >
          <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-28 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-28 md:pt-36">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#C8A96A]">Aurelius</p>
              <p className="mt-4 text-lg text-[#C8A96A]">Boardroom Intelligence</p>
              <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.02] md:text-7xl">
                De AI die boardrooms hun echte probleem laat zien.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#D7DEE5] md:text-xl">
                Analyseer gesprekken, plannen en organisaties in seconden en ontvang een bestuurlijke analyse met
                strategische keuzes en interventies.
              </p>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#C9D3DD] md:text-lg">
                Veel organisaties hebben genoeg data, rapporten en overleg. Wat vaak ontbreekt is helderheid over
                het echte strategische probleem. Aurelius maakt dat zichtbaar.
              </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/aurelius/login"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Ga naar Portal
              </Link>
              <Link
                to="/scan"
                className="inline-flex items-center justify-center rounded-full bg-[#C8A96A] px-8 py-4 text-base font-semibold text-[#0F2A44] transition hover:bg-[#d7b97e]"
              >
                Vraag een strategische analyse aan
                </Link>
                <a
                  href="#voorbeeldanalyse"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Bekijk een voorbeeldanalyse
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#D6DEE5]">
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Bestuurspartner</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Boardroom Intelligence</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Geen SaaS-ruis</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-[520px] rounded-[32px] border border-white/15 bg-[linear-gradient(180deg,_rgba(255,255,255,0.08)_0%,_rgba(255,255,255,0.02)_100%)] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">Strategisch diagram</p>
                <div className="relative mt-8 h-[320px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_rgba(8,18,29,0.4)_100%)]">
                  <div className="absolute left-1/2 top-8 h-[224px] w-px -translate-x-1/2 bg-white/20" />
                  <div className="absolute left-12 right-12 top-1/2 h-px -translate-y-1/2 bg-white/20" />
                  <p className="absolute left-1/2 top-5 -translate-x-1/2 text-sm tracking-wide text-[#D6DEE5]">
                    Impact vergroten
                  </p>
                  <p className="absolute left-6 top-1/2 -translate-y-1/2 text-sm tracking-wide text-[#D6DEE5] md:left-8">
                    Cultuur beschermen
                  </p>
                  <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96A]/60 bg-[#C8A96A]/12 text-center shadow-[0_0_40px_rgba(200,169,106,0.18)]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Aurelius</p>
                      <p className="mt-2 text-sm font-semibold text-white">Insight</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-[#C9D3DD]">
                  Aurelius maakt conflicten zichtbaar waar organisaties nu nog overheen praten.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center md:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">Cyntra Insights</p>
              <p className="mt-2 text-base text-[#D6DEE5]">
                Geen productsite. Een exclusieve ingang naar Aurelius als bestuurspartner.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/aurelius/login" className="marketing-btn-secondary px-6 py-3 text-sm">
                Login naar dashboard
              </Link>
              <Link to="/scan" className="marketing-btn-primary px-6 py-3 text-sm">
                Start strategische analyse
              </Link>
              <Link to="/prijzen" className="marketing-btn-secondary px-6 py-3 text-sm">
                Bekijk prijzen
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Het probleem</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Strategie is vaak minder duidelijk dan het lijkt
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-[#D6DEE5]">
                In veel organisaties spelen dezelfde patronen: discussies blijven terugkomen, rapporten geven geen
                echte richting en strategische keuzes blijven impliciet.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[#D6DEE5]">
                Het probleem is meestal niet een gebrek aan informatie. Het probleem is dat het kernconflict in de
                organisatie niet expliciet wordt gemaakt.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <article className="marketing-card rounded-[28px] p-8">
                <h3 className="text-xl font-semibold text-white">Discussies blijven terugkomen</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                  Organisaties blijven praten over symptomen omdat het onderliggende conflict onbenoemd blijft.
                </p>
              </article>
              <article className="marketing-card rounded-[28px] p-8">
                <h3 className="text-xl font-semibold text-white">Rapporten geven geen echte richting</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                  Er is veel analyse, maar weinig expliciete bestuurlijke keuze.
                </p>
              </article>
              <article className="marketing-card rounded-[28px] p-8">
                <h3 className="text-xl font-semibold text-white">Strategische keuzes blijven impliciet</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                  Daardoor ontstaat ruis, vertraging en eindeloze politieke discussie.
                </p>
              </article>
            </div>

            <div className="mt-14 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,42,68,0.88),_rgba(10,19,31,0.96))] px-8 py-10 text-white shadow-[0_20px_80px_rgba(15,42,68,0.2)] md:px-12">
              <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Wat Aurelius zichtbaar maakt</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">het strategische conflict in de organisatie</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">de onderliggende patronen</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">mogelijke interventies</div>
              </div>
            </div>
          </div>
        </section>

        <section id="voorbeeldanalyse" className="py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Voorbeeldanalyse</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Dit is een voorbeeld van een analyse van Aurelius.
            </h2>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <article className="marketing-card rounded-[30px] p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">Killer Insight</p>
                  <p className="mt-6 text-2xl font-semibold leading-tight text-white">
                    De organisatie heeft geen groeiprobleem.
                    <br />
                    Het heeft een replicatieprobleem.
                  </p>
                  <p className="mt-6 text-base leading-relaxed text-[#D6DEE5]">
                    Het huidige model werkt door cultuur en eigenaarschap in kleine teams. Lineaire groei via personeel
                    ondermijnt dat mechanisme.
                  </p>
                </article>

                <article className="marketing-card rounded-[30px] p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">Mogelijke interventies</p>
                  <ul className="mt-6 space-y-4 text-lg leading-relaxed text-white">
                    <li>Wachttijdtriage opschalen</li>
                    <li>Implementatiepartners voor het model</li>
                    <li>Gemeentelijke pilots om systeemadoptie te versnellen</li>
                  </ul>
                </article>
              </div>

              <article className="rounded-[30px] border border-[#D7DDE5] bg-[linear-gradient(180deg,_#102E49_0%,_#0B2237_100%)] p-8 text-white shadow-[0_18px_60px_rgba(15,42,68,0.18)]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">Strategisch conflict</p>
                <div className="mt-12 text-center">
                  <p className="text-3xl font-semibold text-white">Impact vergroten</p>
                  <p className="mt-6 text-xl text-[#C8A96A]">vs</p>
                  <p className="mt-6 text-3xl font-semibold text-white">Cultuur beschermen</p>
                </div>
                <p className="mt-12 text-base leading-relaxed text-[#D6DEE5]">
                  Als de organisatie snel groeit kan cultuur eroderen. Als de organisatie klein blijft blijft
                  maatschappelijke impact beperkt.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Hoe Aurelius werkt</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Drie stappen. Geen ruis.
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="marketing-card rounded-[28px] p-8">
                <p className="text-sm font-semibold text-[#C8A96A]">1 Upload informatie</p>
                <ul className="mt-5 space-y-3 text-base text-[#D6DEE5]">
                  {uploadItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="marketing-card rounded-[28px] p-8">
                <p className="text-sm font-semibold text-[#C8A96A]">2 Aurelius analyseert</p>
                <ul className="mt-5 space-y-3 text-base text-[#D6DEE5]">
                  {analysisItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="marketing-card rounded-[28px] p-8">
                <p className="text-sm font-semibold text-[#C8A96A]">3 Ontvang bestuursanalyse</p>
                <ul className="mt-5 space-y-3 text-base text-[#D6DEE5]">
                  {reportItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="over-cyntra" className="py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Voor wie is Aurelius</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Voor organisaties die strategische keuzes moeten maken.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
              {audienceItems.map((item) => (
                <article
                  key={item}
                  className="marketing-card rounded-[24px] p-6 text-center text-base font-medium text-white"
                >
                  {item}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#0F2A44] py-24 text-white">
          <div className="mx-auto max-w-5xl px-6 text-center md:px-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">CTA</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              Laat Aurelius jouw organisatie analyseren
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-[#D6DEE5]">
              Upload een gesprek, rapport of document en ontvang een bestuurlijke analyse met strategische inzichten
              en interventies.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/scan"
                className="inline-flex items-center justify-center rounded-full bg-[#C8A96A] px-8 py-4 text-base font-semibold text-[#0F2A44] transition hover:bg-[#d7b97e]"
              >
                Start een analyse
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Plan een gesprek
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
