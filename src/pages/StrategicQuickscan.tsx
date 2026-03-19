import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AUTH_DEFAULT_AFTER_LOGIN_PATH, AUTH_LOGIN_PATH } from "@/auth/authPaths";

const scanBlocks = [
  "Dominante bestuurlijke these",
  "Structurele kernspanning",
  "Kort beslissignaal",
  "Aanbevolen vervolgstap",
];

const scanSignals = [
  "Waar blijft besluitvorming hangen?",
  "Welke keuze wordt vermeden?",
  "Waar is eigenaarschap formeel aanwezig maar feitelijk afwezig?",
  "Welke spanning wordt al gevoeld maar nog niet hardop benoemd?",
];

const sectorSuggestions = [
  "Zorg",
  "Publiek",
  "Commercieel",
  "Scale-up",
  "Investeerder",
  "Adviesbureau",
];

type ScanPreview = {
  thesis: string;
  tension: string;
  signal: string;
};

function buildPreview({
  organization,
  sector,
  challenge,
}: {
  organization: string;
  sector: string;
  challenge: string;
}): ScanPreview {
  const normalizedSector = sector.toLowerCase();
  const normalizedChallenge = challenge.toLowerCase();

  if (normalizedSector.includes("zorg")) {
    return {
      thesis: `${organization} lijkt niet primair op vraag vast te lopen, maar op spanning tussen zorgvraag, capaciteit en bestuurlijke sturing.`,
      tension: "Meer maatschappelijke dekking versus uitvoerbaarheid binnen teams en contractruimte.",
      signal: "Een volledig rapport moet nu vooral blootleggen waar wachtdruk, caseload en governance elkaar versterken.",
    };
  }

  if (normalizedSector.includes("publiek")) {
    return {
      thesis: `${organization} lijkt vooral te botsen tussen publieke legitimiteit en bestuurlijke uitvoerbaarheid.`,
      tension: "Brede beleidsambitie versus uitvoerbare prioritering en mandaatdiscipline.",
      signal: "Een volledig rapport moet nu vooral zichtbaar maken waar governance, besluitritme en eigenaarschap uit elkaar lopen.",
    };
  }

  if (normalizedSector.includes("scale") || normalizedChallenge.includes("groei")) {
    return {
      thesis: `${organization} lijkt niet op gebrek aan ambitie vast te lopen, maar op spanning tussen groeitempo en operationele absorptie.`,
      tension: "Commerciele versnelling versus leveringscapaciteit en teamstabiliteit.",
      signal: "Een volledig rapport moet nu vooral tonen waar groei sneller gaat dan uitvoering, onboarding of retentie kan dragen.",
    };
  }

  if (normalizedSector.includes("investeerder")) {
    return {
      thesis: `${organization} lijkt te sturen op upside, terwijl de echte spanning waarschijnlijk in concentratierisico en uitvoerbaarheid zit.`,
      tension: "Portefeuille-uitbreiding versus bestuurlijke grip op risico en interventietempo.",
      signal: "Een volledig rapport moet nu vooral blootleggen waar waardecreatie botst met governance en execution discipline.",
    };
  }

  return {
    thesis: `${organization} lijkt niet primair op informatiegebrek vast te lopen, maar op een impliciete strategische keuze die nog niet hard is gemaakt.`,
    tension: "Ambitie versus operationele en bestuurlijke uitvoerbaarheid.",
    signal: "Een volledig rapport moet nu vooral expliciteren welk kernconflict besluitvorming vertraagt en welke keuze eerst gemaakt moet worden.",
  };
}

export default function StrategicQuickscan() {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState("");
  const [sector, setSector] = useState("Zorg");
  const [challenge, setChallenge] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const preview = useMemo(
    () =>
      buildPreview({
        organization: organization.trim() || "Deze organisatie",
        sector,
        challenge,
      }),
    [organization, sector, challenge]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    navigate(AUTH_LOGIN_PATH, {
      state: {
        from: AUTH_DEFAULT_AFTER_LOGIN_PATH,
        source: "marketing-scan",
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Cyntra Scan | Korte bestuurlijke diagnose</title>
        <meta
          name="description"
          content="Compacte bestuursscan met een korte diagnose en een login-CTA voor het volledige Aurelius rapport."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell py-24 md:py-32">
        <section className="marketing-container text-center">
          <p className="mb-6 text-sm uppercase tracking-[0.18em]">Cyntra Scan</p>
          <h1 className="mb-8 text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Geen vragenlijst.
            <br />
            Een korte bestuurlijke diagnose.
          </h1>
          <p className="mx-auto max-w-4xl text-xl text-[#b8c2d4] md:text-2xl">
            Publieke scan voor een eerste signaal. De volledige boardroomanalyse
            opent daarna in Aurelius.
          </p>
        </section>

        <section className="marketing-container mt-16 md:mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <article className="marketing-card">
              <h2 className="mb-8 text-3xl font-black md:text-4xl">Wat de scan blootlegt</h2>
              <div className="space-y-4 text-lg md:text-xl">
                {scanBlocks.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>

            <article className="marketing-card">
              <h2 className="mb-8 text-3xl font-black md:text-4xl">Waar we op scannen</h2>
              <div className="space-y-4 text-lg md:text-xl">
                {scanSignals.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSubmit} className="marketing-card rounded-[28px] p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">Korte intake</p>
              <h2 className="mt-4 text-3xl font-black text-white">Genereer een eerste signaal</h2>

              <div className="mt-8 space-y-5">
                <label className="block text-left">
                  <span className="mb-2 block text-sm text-[#D6DEE5]">Organisatie</span>
                  <input
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    placeholder="Organisatienaam"
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-2 block text-sm text-[#D6DEE5]">Sector</span>
                  <select
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white focus:border-[#C8A96A] focus:outline-none"
                  >
                    {sectorSuggestions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-left">
                  <span className="mb-2 block text-sm text-[#D6DEE5]">Kernuitdaging</span>
                  <textarea
                    value={challenge}
                    onChange={(event) => setChallenge(event.target.value)}
                    placeholder="Beschrijf in 1-2 zinnen waar besluitvorming, groei of uitvoering vastloopt."
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1826] px-4 py-3 text-white placeholder:text-[#93a0b6] focus:border-[#C8A96A] focus:outline-none"
                  />
                </label>
              </div>

              <button type="submit" className="marketing-btn-primary mt-8 px-8 py-4 text-base">
                Genereer korte output
              </button>
            </form>

            <section className="marketing-card rounded-[28px] p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">Korte output</p>
              <h2 className="mt-4 text-3xl font-black text-white">Bestuurlijk previewsignaal</h2>

              <div className="mt-8 space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Dominante these</p>
                  <p className="mt-3 text-base leading-relaxed text-[#E7ECF3]">{preview.thesis}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Waarschijnlijke spanning</p>
                  <p className="mt-3 text-base leading-relaxed text-[#E7ECF3]">{preview.tension}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#C8A96A]">Vervolg</p>
                  <p className="mt-3 text-base leading-relaxed text-[#E7ECF3]">{preview.signal}</p>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#C8A96A]/20 bg-[#C8A96A]/8 p-6">
                <p className="text-sm leading-relaxed text-[#E7ECF3]">
                  {submitted
                    ? "De korte output staat klaar. Log in om het volledige boardroomrapport, de scenariovergelijking en bestuurlijke acties te openen."
                    : "Deze pagina geeft bewust alleen een korte publieke diagnose. Voor het volledige rapport is login vereist."}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to={AUTH_LOGIN_PATH} className="marketing-btn-primary px-8 py-4 text-base">
                    Login voor volledig rapport
                  </Link>
                  <Link to="/aurelius" className="marketing-btn-secondary px-8 py-4 text-base">
                    Bekijk Aurelius
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
