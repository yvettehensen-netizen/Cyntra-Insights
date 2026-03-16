import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const scanBlocks = [
  "Dominante bestuurlijke these",
  "Structurele kernspanning en verlies",
  "Mandaatverschuiving en gates",
  "Decision Contract",
];

const scanSignals = [
  "Waar blijft besluitvorming hangen?",
  "Welke keuze wordt vermeden?",
  "Waar is eigenaarschap formeel aanwezig maar feitelijk afwezig?",
  "Welke spanning wordt al gevoeld maar nog niet hardop benoemd?",
];

export default function StrategicQuickscan() {
  return (
    <>
      <Helmet>
        <title>Cyntra Scan | Bestuurlijke ingreep</title>
        <meta
          name="description"
          content="Compacte bestuursscan voor organisaties waar besluitvorming vertraagt, eigenaarschap vervaagt en spanning oploopt."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell py-24 md:py-32">
        <section className="marketing-container text-center">
          <p className="text-sm uppercase tracking-[0.18em] mb-6">Cyntra Scan</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] mb-8">
            Geen vragenlijst.
            <br />
            Een bestuurlijke diagnose.
          </h1>
          <p className="mx-auto text-xl md:text-2xl text-[#b8c2d4] max-w-4xl">
            Voor organisaties waar besluitvorming vertraagt, spanningen oplopen en niemand nog precies kan uitleggen
            waarom uitvoering vastloopt.
          </p>
        </section>

        <section className="marketing-container mt-16 md:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <article className="marketing-card">
              <h2 className="text-3xl md:text-4xl font-black mb-8">Wat de scan blootlegt</h2>
              <div className="space-y-4 text-lg md:text-xl">
                {scanBlocks.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>

            <article className="marketing-card">
              <h2 className="text-3xl md:text-4xl font-black mb-8">Waar we op scannen</h2>
              <div className="space-y-4 text-lg md:text-xl">
                {scanSignals.map((item) => (
                  <p key={item}>{item}</p>
                ))}
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
    </>
  );
}
