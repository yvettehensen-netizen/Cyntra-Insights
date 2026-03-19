import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const dossierLayers = [
  "Executive decision card",
  "Strategisch verhaal",
  "Scenariovergelijking",
  "Mechanisme analyse",
  "Bestuurlijke acties",
];

const decisionSignals = [
  {
    title: "Kernprobleem",
    body: "Een breed gemeentenportfolio legt meer variatie in contractcondities en instroom op de organisatie dan vaste teams kunnen absorberen.",
  },
  {
    title: "Strategische spanning",
    body: "Regionale relevantie behouden versus uitvoerbaarheid binnen teamcapaciteit en contractrendement.",
  },
  {
    title: "Aanbevolen keuze",
    body: "Rationaliseer het portfolio en stuur actief op kern-, behoud- en uitstapgemeenten.",
  },
];

const scenarioCards = [
  {
    title: "Scenario A",
    subtitle: "Kern beschermen",
    body: "Herstel bestuurbaarheid door portfoliofocus, contractdiscipline en bescherming van cultuurkapitaal.",
  },
  {
    title: "Scenario B",
    subtitle: "Parallel verbreden",
    body: "Meer labels en bereik, maar ook meer operationele ruis en druk op teamstabiliteit.",
  },
  {
    title: "Scenario C",
    subtitle: "Partnermodel",
    body: "Vergroot bereik via partners, maar maakt kwaliteit en mandaat governance-afhankelijk.",
  },
];

export default function DemoPage() {
  return (
    <>
      <Helmet>
        <title>Voorbeeldanalyse | Cyntra Insights</title>
        <meta
          name="description"
          content="Een voorbeeld van hoe Cyntra een organisatievraagstuk vertaalt naar een boardroomdossier met spanning, scenario's en acties."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell overflow-hidden text-white">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.22),_transparent_28%),radial-gradient(circle_at_82%_18%,_rgba(130,164,255,0.16),_transparent_24%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] py-24 md:py-32">
          <div className="marketing-container">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                  Voorbeeldanalyse
                </p>
                <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                  Dit is geen rapport.
                  <br />
                  Dit is een boardroomdossier.
                </h1>
                <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#D6DEE5]">
                  Cyntra vertaalt een organisationeel vraagstuk niet naar meer tekst,
                  maar naar een expliciete bestuurskeuze met spanning, scenario&apos;s
                  en een uitvoerbare vervolgorde.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                    Start korte scan
                  </Link>
                  <Link to="/aurelius/login" className="marketing-btn-secondary px-8 py-4 text-base">
                    Login volledig rapport
                  </Link>
                </div>
              </div>

              <ExampleDossierVisual />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Wat je hier ziet
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Een voorbeeld van hoe Cyntra analyse ordent voor bestuur.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {decisionSignals.map((item) => (
                <article key={item.title} className="marketing-card rounded-[28px] p-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                    Besliskern
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.028),_rgba(255,255,255,0.012))] py-24">
          <div className="marketing-container">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                  Dossierlagen
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                  Cyntra bouwt een besluitvolgorde, geen documentstapel.
                </h2>
                <div className="mt-10 space-y-4">
                  {dossierLayers.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C8A96A]/40 bg-[#C8A96A]/10 text-sm font-semibold text-[#E7D5A5]">
                        {index + 1}
                      </div>
                      <p className="text-lg text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="marketing-card rounded-[30px] p-8">
                <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                  Mechanismebeeld
                </p>
                <div className="relative mt-8 min-h-[360px] rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(200,169,106,0.12),_transparent_44%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))]">
                  <div className="absolute left-[22%] top-[26%] rounded-full border border-white/10 bg-[#112235] px-4 py-3 text-sm text-white">
                    Contractmix
                  </div>
                  <div className="absolute left-[50%] top-[26%] -translate-x-1/2 rounded-full border border-white/10 bg-[#112235] px-4 py-3 text-sm text-white">
                    Caseload
                  </div>
                  <div className="absolute right-[14%] top-[26%] rounded-full border border-white/10 bg-[#112235] px-4 py-3 text-sm text-white">
                    Wachttijd
                  </div>
                  <div className="absolute left-[28%] top-[62%] rounded-full border border-white/10 bg-[#112235] px-4 py-3 text-sm text-white">
                    Marge
                  </div>
                  <div className="absolute right-[20%] top-[62%] rounded-full border border-white/10 bg-[#112235] px-4 py-3 text-sm text-white">
                    Teamdruk
                  </div>
                  <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96A]/45 bg-[#C8A96A]/10 text-center shadow-[0_0_34px_rgba(200,169,106,0.18)]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#C8A96A]">Cyntra</p>
                      <p className="mt-2 text-sm font-semibold text-white">Boardroom Logic</p>
                    </div>
                  </div>
                  <div className="absolute left-[28%] top-[33%] h-px w-[22%] bg-[#C8A96A]/35" />
                  <div className="absolute left-1/2 top-[33%] h-px w-[22%] bg-[#C8A96A]/35" />
                  <div className="absolute left-[34%] top-[56%] h-px w-[18%] bg-[#C8A96A]/25" />
                  <div className="absolute right-[28%] top-[56%] h-px w-[18%] bg-[#C8A96A]/25" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Scenariovergelijking
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Niet drie decoratieve opties, maar drie bestuurlijke paden.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {scenarioCards.map((item) => (
                <article key={item.title} className="marketing-card rounded-[28px] p-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">{item.title}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{item.subtitle}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="marketing-container">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,42,68,0.78),_rgba(10,19,31,0.96))] px-8 py-12 text-white md:px-12">
              <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
                Volgende stap
              </p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
                Eerst een korte publieke indruk. Daarna pas het volledige dossier.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6DEE5]">
                Deze voorbeeldpagina laat de vorm zien. Het volledige rapport, de echte
                scenariovergelijking en de gesloten rapportlaag open je daarna via Aurelius.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                  Start korte scan
                </Link>
                <Link to="/aurelius/login" className="marketing-btn-secondary px-8 py-4 text-base">
                  Login volledig rapport
                </Link>
                <Link to="/contact" className="marketing-btn-secondary px-8 py-4 text-base">
                  Plan intake
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ExampleDossierVisual() {
  return (
    <div className="marketing-card rounded-[34px] p-8 md:p-10">
      <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">
        Cyntra dossierpreview
      </p>
      <div className="mt-8 space-y-5">
        <div className="rounded-[24px] border border-[#C8A96A]/20 bg-[linear-gradient(180deg,_rgba(200,169,106,0.12),_rgba(200,169,106,0.05))] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E0C88E]">Executive decision card</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Moet het bestuur focus kiezen of breedte behouden?</h2>
          <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
            Het voorbeeld laat zien hoe Cyntra in één scherm probleem, spanning,
            aanbevolen keuze en stopregels bundelt.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/4 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Spanningsbeeld</p>
            <div className="mt-8 text-center">
              <p className="text-2xl font-semibold text-white">Brede aanwezigheid</p>
              <p className="mt-4 text-lg text-[#C8A96A]">versus</p>
              <p className="mt-4 text-2xl font-semibold text-white">Contractdiscipline</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/4 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Uitkomst</p>
            <div className="mt-6 space-y-3 text-sm text-[#D6DEE5]">
              <p>kernprobleem</p>
              <p>mechanisme</p>
              <p>scenario's</p>
              <p>acties</p>
              <p>stopregels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
