import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const contactReasons = [
  {
    title: "Bestuurlijke intake",
    body: "Voor organisaties waar besluitvorming vertraagt, spanning oploopt of de volgende strategische keuze expliciet gemaakt moet worden.",
  },
  {
    title: "Aurelius demonstratie",
    body: "Voor teams die de engine, het boardroom dossier en de besluitlogica eerst in een concrete productdemo willen zien.",
  },
  {
    title: "Strategische verkenning",
    body: "Voor investeerders, adviesbureaus en directies die willen toetsen of Cyntra past bij hun analyse- en interventievraagstuk.",
  },
];

const processSteps = [
  {
    title: "1. Intake",
    body: "Je beschrijft kort de organisatie, de sector en waar besluitvorming of uitvoering vastloopt.",
  },
  {
    title: "2. Verheldering",
    body: "We bepalen of een korte scan, productdemo of volledige Aurelius analyse de juiste volgende stap is.",
  },
  {
    title: "3. Vervolg",
    body: "Je krijgt een duidelijke route: publieke scan, loginflow of een gerichte intake voor een boardroom traject.",
  },
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact | Cyntra Insights</title>
        <meta
          name="description"
          content="Plan een gesprek met Cyntra over strategische analyse, Aurelius en bestuurlijke besluitvorming."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell overflow-hidden text-white">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.18),_transparent_28%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] py-24 md:py-32">
          <div className="marketing-container">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                  Contact
                </p>
                <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                  Een goed gesprek begint met een scherp vraagstuk.
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#D6DEE5] md:text-xl">
                  Gebruik deze pagina voor een bestuurlijke intake, een Aurelius
                  demonstratie of een eerste verkenning van jouw strategische
                  situatie.
                </p>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#C9D3DD] md:text-lg">
                  Cyntra is geen generiek adviesloket. We reageren het snelst als je
                  kort benoemt waar besluitvorming, uitvoering of strategische focus
                  nu vastloopt.
                </p>

                <div className="mt-10 space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                      Verwachting
                    </p>
                    <p className="mt-3 text-base leading-relaxed text-[#D6DEE5]">
                      Deze pagina is bedoeld voor echte intakevragen. Voor een snelle
                      eerste indruk gebruik je beter eerst de korte scan of de
                      Aurelius productpagina.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/scan" className="marketing-btn-primary px-6 py-3 text-sm">
                      Start korte scan
                    </Link>
                    <Link to="/aurelius" className="marketing-btn-secondary px-6 py-3 text-sm">
                      Bekijk Aurelius
                    </Link>
                    <Link to="/aurelius/login" className="marketing-btn-secondary px-6 py-3 text-sm">
                      Login volledig rapport
                    </Link>
                  </div>
                </div>
              </div>

              <div className="marketing-card rounded-[32px] p-8 md:p-10">
                <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">
                  Bestuurlijke intake
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-white">
                  Vertel kort wat er speelt
                </h2>

                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  action="/bedankt"
                  className="mt-8 flex flex-col gap-5"
                >
                  <input type="hidden" name="form-name" value="contact" />

                  <label className="flex flex-col text-left">
                    <span className="mb-2 text-sm text-[#D6DEE5]">Naam</span>
                    <input
                      type="text"
                      name="name"
                      required
                      className="rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col text-left">
                    <span className="mb-2 text-sm text-[#D6DEE5]">E-mail</span>
                    <input
                      type="email"
                      name="email"
                      required
                      className="rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col text-left">
                    <span className="mb-2 text-sm text-[#D6DEE5]">Organisatie</span>
                    <input
                      type="text"
                      name="organization"
                      className="rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col text-left">
                    <span className="mb-2 text-sm text-[#D6DEE5]">Waar gaat het over?</span>
                    <select
                      name="topic"
                      className="rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white focus:border-[#C8A96A] focus:outline-none"
                      defaultValue="bestuurlijke-intake"
                    >
                      <option value="bestuurlijke-intake">Bestuurlijke intake</option>
                      <option value="aurelius-demo">Aurelius demonstratie</option>
                      <option value="strategische-verkenning">Strategische verkenning</option>
                    </select>
                  </label>

                  <label className="flex flex-col text-left">
                    <span className="mb-2 text-sm text-[#D6DEE5]">Bericht</span>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      placeholder="Beschrijf kort de spanning, het besluit of de uitvoeringsbreuk die nu speelt."
                      className="rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                    />
                  </label>

                  <button type="submit" className="marketing-btn-primary px-8 py-4 text-base">
                    Verstuur intake
                  </button>
                </form>

                <p className="mt-6 text-sm leading-relaxed text-[#9FB0C0]">
                  Korte berichten met sector, spanning en gewenste vervolgstap zijn het
                  snelst te beoordelen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Wanneer contact zinvol is
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Niet voor algemene nieuwsgierigheid, wel voor echte strategische druk.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {contactReasons.map((item) => (
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

        <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.028),_rgba(255,255,255,0.012))] py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Hoe het vervolg eruit ziet
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Kort, concreet en zonder consultancy-ruis.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {processSteps.map((item) => (
                <article key={item.title} className="marketing-card rounded-[28px] p-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                    Proces
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

        <section className="py-24">
          <div className="marketing-container">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,42,68,0.78),_rgba(10,19,31,0.96))] px-8 py-12 text-white md:px-12">
              <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
                Alternatieve routes
              </p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
                Eerst zelf oriënteren kan ook.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6DEE5]">
                Niet elk vraagstuk begint met een intake. Soms is een korte scan of de
                Aurelius productpagina de betere eerste stap.
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
          </div>
        </section>
      </main>
    </>
  );
}
