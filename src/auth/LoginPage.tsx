import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Chrome,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  AUTH_DEFAULT_AFTER_LOGIN_PATH,
  AUTH_RESET_PASSWORD_PATH,
  AUTH_SIGNUP_PATH,
  toAuthAbsolute,
} from "./authPaths";

const detectionCards = [
  {
    title: "Strategisch conflict",
    body: "Aurelius zoekt de keuze die bestuurders feitelijk ontwijken, niet de analyse die al op tafel ligt.",
  },
  {
    title: "Structurele patronen",
    body: "De engine verbindt terugkerende fricties in capaciteit, governance, financiering en uitvoering.",
  },
  {
    title: "Bestuurlijke keuzes",
    body: "Het resultaat is geen rapportstapel maar een expliciete beslisrichting met scenario's en stopregels.",
  },
];

const audienceItems = [
  "zorgorganisaties",
  "publieke instellingen",
  "commerciele bedrijven",
  "scale-ups",
  "investeerders",
  "adviesbureaus",
];

const reportFailureCards = [
  {
    title: "Te veel analyse",
    body: "Rapporten stapelen feiten op, maar markeren niet waar het systeem werkelijk breekt.",
  },
  {
    title: "Geen besluit",
    body: "Bestuurders krijgen samenvattingen, terwijl ze een expliciete keuzearchitectuur nodig hebben.",
  },
  {
    title: "Geen mechanisme",
    body: "Zonder oorzaak-gevolgketen blijft onduidelijk waarom druk op marge, capaciteit of governance oploopt.",
  },
];

const insideEngineCards = [
  {
    title: "Pattern Detection",
    body: "Aurelius vergelijkt signalen uit gesprekken, documenten en context om terugkerende spanningen en breuklijnen te herkennen.",
  },
  {
    title: "Mechanism Mapping",
    body: "De engine legt oorzaak-gevolgketens bloot tussen governance, capaciteit, financiering, margedruk en operationele uitvoerbaarheid.",
  },
  {
    title: "Conflict Extraction",
    body: "Uit die mechanismen haalt Aurelius het bestuurlijke kernconflict dat richting geeft aan scenario's, interventies en besluitvorming.",
  },
];

const ingestItems = [
  "Bestuursgesprekken",
  "Strategische plannen",
  "Beleidsdocumenten",
  "Organisatiedata",
  "Interviews",
];

const engineItems = [
  "Mechanisme analyse",
  "Patroon detectie",
  "Governance mapping",
  "Capaciteitsanalyse",
];

const outcomeItems = [
  "Strategisch kernconflict",
  "Scenario analyse",
  "Bestuurlijke interventies",
  "Boardroom besluit",
];

const systemNodes = [
  { title: "Governance", x: "12%", y: "18%" },
  { title: "Capaciteit", x: "24%", y: "52%" },
  { title: "Financiering", x: "24%", y: "82%" },
  { title: "Caseload", x: "56%", y: "52%" },
  { title: "Wachttijd", x: "78%", y: "52%" },
  { title: "Groei", x: "78%", y: "82%" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToRaw =
    (location.state as { from?: string } | null)?.from ||
    AUTH_DEFAULT_AFTER_LOGIN_PATH;
  const redirectTo =
    redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : AUTH_DEFAULT_AFTER_LOGIN_PATH;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirectTo, { replace: true });
      setCheckingSession(false);
    });
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError("Onjuiste inloggegevens");
      setLoading(false);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: toAuthAbsolute(redirectTo) },
    });

    if (oauthError) {
      setError("Google login mislukt");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="marketing-shell flex min-h-screen items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#e8c670]" />
      </div>
    );
  }

  return (
    <main className="marketing-readable marketing-shell overflow-hidden text-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.18),_transparent_28%),radial-gradient(circle_at_82%_18%,_rgba(138,174,255,0.16),_transparent_24%),linear-gradient(135deg,_#091523_0%,_#0F2438_52%,_#0A1624_100%)] pb-24 pt-20 md:pb-28 md:pt-28">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,rgba(255,255,255,0.01)_100%)]" />
        <div className="marketing-container relative z-10">
          <div className="grid gap-12 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-[#C8A96A]">
                Aurelius Engine
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                Aurelius - de strategische analyse-engine achter Cyntra
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#D6DEE5] md:text-xl">
                Aurelius analyseert gesprekken, documenten en organisatiestructuren om
                het strategisch kernconflict zichtbaar te maken waar bestuurders
                werkelijk over moeten beslissen.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#hoe-aurelius-werkt"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/8"
                >
                  Bekijk hoe Aurelius werkt
                </a>
                <Link
                  to="/scan"
                  className="inline-flex items-center justify-center rounded-full bg-[#C8A96A] px-8 py-4 text-base font-semibold text-[#0B1826] transition hover:bg-[#d7b97e]"
                >
                  Start analyse
                </Link>
              </div>
              <div className="mt-10">
                <EngineArchitectureVisual />
              </div>
            </div>

            <div className="xl:pl-8">
              <AuthCard
                email={email}
                password={password}
                loading={loading}
                error={error}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onGoogleLogin={handleGoogleLogin}
                onSubmit={handleLogin}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Wat Aurelius detecteert
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Aurelius zoekt geen data. Het zoekt het kernconflict.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {detectionCards.map((card) => (
              <article key={card.title} className="marketing-card rounded-[28px] p-8">
                <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                  Detectie
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="hoe-aurelius-werkt"
        className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))] py-24"
      >
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Hoe de engine werkt
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              De analyse-architectuur van Aurelius
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <ProcessCard
              step="1"
              title="Ingestie"
              body="Aurelius leest gesprekken, beleidsdocumenten, strategische plannen en rapporten als inputlaag voor bestuurlijke diagnose."
              items={["gesprekken", "beleidsdocumenten", "strategische plannen", "rapporten"]}
            />
            <ProcessCard
              step="2"
              title="Mechanisme analyse"
              body="De engine identificeert economische mechanismen, governance structuren, capaciteitsgrenzen en incentives."
              items={["economische mechanismen", "governance structuren", "capaciteitsgrenzen", "incentives"]}
            />
            <ProcessCard
              step="3"
              title="Strategisch conflict"
              body="Aurelius destilleert het kernconflict, mogelijke scenario's en bestuurlijke interventies."
              items={["kernconflict", "mogelijke scenario's", "bestuurlijke interventies", "boardroom besluit"]}
            />
          </div>

          <div className="mt-14">
            <SystemDynamicsVisual />
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Van analyse naar besluit
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Van analyse naar bestuur
            </h2>
          </div>
          <div className="mt-12">
            <DecisionFlowVisual />
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.028),_rgba(255,255,255,0.012))] py-24">
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Inside the Engine
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              De interne redenering van Aurelius
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6DEE5] md:text-lg">
              Aurelius werkt niet als samenvattingslaag maar als strategische
              analysestack. Het reduceert ruwe input naar patronen, mechanismen en
              uiteindelijk bestuurlijke spanning.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {insideEngineCards.map((card) => (
              <article key={card.title} className="marketing-card rounded-[28px] p-8">
                <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">
                  Engine layer
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))] py-24">
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Waarom normale rapporten falen
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Analyse zonder mechanisme leidt zelden tot besluit
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reportFailureCards.map((card) => (
              <article key={card.title} className="marketing-card rounded-[28px] p-8">
                <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="marketing-container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">
              Waar Aurelius wordt gebruikt
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Gebouwd voor besluitvorming in complexe organisaties
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audienceItems.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-white/4 px-6 py-6 text-lg text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="marketing-container">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,42,68,0.78),_rgba(10,19,31,0.96))] px-8 py-12 text-white md:px-12">
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Laat Aurelius jouw organisatie analyseren</p>
            <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Een boardroomdossier begint met een heldere diagnose van het systeem.
            </h2>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                Start analyse
              </Link>
              <Link to="/contact" className="marketing-btn-secondary px-8 py-4 text-base">
                Plan gesprek
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthCard({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onGoogleLogin,
  onSubmit,
}: {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onGoogleLogin: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,_rgba(255,255,255,0.07)_0%,_rgba(255,255,255,0.02)_100%)] p-8 shadow-[0_24px_90px_rgba(3,8,16,0.35)] backdrop-blur-xl md:p-10 xl:sticky xl:top-28">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C8A96A]/45 bg-[#C8A96A]/10">
          <LockKeyhole className="h-5 w-5 text-[#C8A96A]" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">Besloten toegang</p>
          <p className="mt-1 text-base text-[#D6DEE5]">
            Login voor de Cyntra boardroomomgeving.
          </p>
        </div>
      </div>

      <button
        onClick={onGoogleLogin}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#C8A96A] px-6 py-4 text-base font-semibold text-[#0B1826] transition hover:bg-[#d7b97e] disabled:opacity-60"
      >
        <Chrome className="h-5 w-5" />
        Betreed via Google
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e8c670]/20" />
        <span className="text-xs uppercase tracking-[0.22em] text-[#95a1b8]">of</span>
        <div className="h-px flex-1 bg-[#e8c670]/20" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="E-mailadres"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-2xl border border-[#e8c670]/20 bg-[#0d1826] px-4 py-3 text-[#f8f9fc] placeholder:text-[#95a1b8] focus:border-[#e8c670] focus:outline-none"
        />

        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-2xl border border-[#e8c670]/20 bg-[#0d1826] px-4 py-3 text-[#f8f9fc] placeholder:text-[#95a1b8] focus:border-[#e8c670] focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-white/14 bg-white/6 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#b94c4c]/40 bg-[#351923]/70 p-4 text-sm text-[#ffd8d8]">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3 text-sm text-[#9ba5ba]">
        <p>Alle activiteit wordt bestuurlijk gelogd. Mandaat is vereist.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to={AUTH_RESET_PASSWORD_PATH} className="text-[#e8c670] hover:text-[#f1d998]">
            Wachtwoord vergeten
          </Link>
          <Link to={AUTH_SIGNUP_PATH} className="text-[#e8c670] hover:text-[#f1d998]">
            Account aanmaken
          </Link>
          <Link to="/" className="text-[#e8c670] hover:text-[#f1d998]">
            Terug naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({
  step,
  title,
  body,
  items,
}: {
  step: string;
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <article className="marketing-card rounded-[28px] p-8">
      <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">Stap {step}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">{body}</p>
      <ul className="mt-6 space-y-3 text-sm text-[#D6DEE5]">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function EngineArchitectureVisual() {
  return (
    <div className="rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,_rgba(255,255,255,0.06)_0%,_rgba(255,255,255,0.02)_100%)] p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.1fr_0.95fr]">
        <VisualColumn title="Input" items={ingestItems} align="left" />
        <div className="relative overflow-hidden rounded-[28px] border border-[#C8A96A]/20 bg-[radial-gradient(circle_at_center,_rgba(200,169,106,0.16),_transparent_44%),linear-gradient(180deg,_rgba(9,19,32,0.86),_rgba(8,15,24,0.92))] px-6 py-8">
          <div className="absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.45),transparent)] lg:block" />
          <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(200,169,106,0.28),transparent)] lg:block" />
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-[#C8A96A]/50 bg-[#C8A96A]/10 shadow-[0_0_45px_rgba(200,169,106,0.22)]">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">Aurelius</p>
              <p className="mt-2 text-lg font-semibold text-white">Engine</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {engineItems.map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-center text-sm text-[#D6DEE5]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <VisualColumn title="Strategisch resultaat" items={outcomeItems} align="right" />
      </div>
    </div>
  );
}

function VisualColumn({
  title,
  items,
  align,
}: {
  title: string;
  items: string[];
  align: "left" | "right";
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_rgba(255,255,255,0.02)_100%)] p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-[#C8A96A]">{title}</p>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item} className="relative rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-[#D6DEE5]">
            <span
              className={`absolute top-1/2 hidden h-px w-10 -translate-y-1/2 bg-[#C8A96A]/40 lg:block ${
                align === "left" ? "-right-11" : "-left-11"
              }`}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemDynamicsVisual() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(11,23,36,0.9),_rgba(8,15,24,0.96))] p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[320px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))]">
          <div className="absolute left-[24%] top-[52%] h-px w-[32%] bg-[#C8A96A]/40" />
          <div className="absolute left-[56%] top-[52%] h-px w-[22%] bg-[#C8A96A]/40" />
          <div className="absolute left-[24%] top-[82%] h-px w-[54%] bg-[#C8A96A]/28" />
          <div className="absolute left-[24%] top-[52%] h-[30%] w-px bg-[#C8A96A]/28" />
          <div className="absolute left-[78%] top-[52%] h-[30%] w-px bg-[#C8A96A]/28" />
          <div className="absolute left-[12%] top-[18%] h-[34%] w-px bg-[#C8A96A]/28" />
          {systemNodes.map((node) => (
            <div
              key={node.title}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#122338] px-4 py-3 text-sm text-white shadow-[0_0_24px_rgba(200,169,106,0.08)]"
              style={{ left: node.x, top: node.y }}
            >
              {node.title}
            </div>
          ))}
          <div className="absolute left-1/2 top-[34%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96A]/45 bg-[#C8A96A]/10 text-center shadow-[0_0_32px_rgba(200,169,106,0.18)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#C8A96A]">Aurelius</p>
              <p className="mt-2 text-sm font-semibold text-white">System Analysis</p>
            </div>
          </div>
          <div className="absolute left-1/2 top-[68%] -translate-x-1/2 rounded-full border border-[#C8A96A]/25 bg-[#C8A96A]/8 px-5 py-3 text-sm text-[#E6D7B2]">
            Strategisch conflict
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">Systeemmechanisme</p>
            <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
              Aurelius modelleert hoe governance, capaciteit en financiering druk
              op caseload, wachttijd en groei veroorzaken.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">Conflict extractie</p>
            <p className="mt-4 text-base leading-relaxed text-[#D6DEE5]">
              Het systeemdiagram is geen visual effect, maar de stap waarin losse
              signalen worden teruggebracht tot bestuurlijke spanning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionFlowVisual() {
  const stages = [
    { title: "Data", items: ["gesprekken", "documenten", "context"] },
    { title: "Analyse", items: ["signalen", "drukpunten", "patronen"] },
    { title: "Mechanisme", items: ["oorzaak", "effect", "grens"] },
    { title: "Besluit", items: ["besliskaart", "scenario analyse", "stresstest"] },
  ];

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-8">
      <div className="grid gap-4 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <div key={stage.title} className="relative rounded-[24px] border border-white/8 bg-white/4 p-6">
            {index < stages.length - 1 ? (
              <div className="absolute right-[-18px] top-1/2 hidden h-px w-9 -translate-y-1/2 bg-[#C8A96A]/40 lg:block" />
            ) : null}
            <p className="text-sm uppercase tracking-[0.2em] text-[#C8A96A]">{stage.title}</p>
            <ul className="mt-5 space-y-3 text-sm text-[#D6DEE5]">
              {stage.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
