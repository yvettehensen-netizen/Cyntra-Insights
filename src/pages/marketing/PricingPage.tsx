import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const analysisPlans = [
  {
    label: "Boardroom Analyse",
    price: "EUR750",
    items: [
      "dominante these",
      "kernspanning",
      "strategische opties",
      "prijs van uitstel",
    ],
    cta: { label: "Start analyse", to: "/scan", kind: "secondary" as const },
  },
  {
    label: "Strategisch Besluitdocument",
    price: "EUR2.500",
    items: [
      "dominante these",
      "structurele kernspanning",
      "expliciet verlies",
      "90-dagen interventieplan",
    ],
    cta: { label: "Genereer besluitdocument", to: "/besluitdocument", kind: "secondary" as const },
  },
];

const interventionPlan = {
  label: "Interventieontwerp",
  price: "EUR25k - EUR45k",
  items: [
    "Aurelius diagnose",
    "15+ interventies",
    "beslisgates",
    "decision contract",
  ],
};

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Prijzen | Cyntra Insights</title>
        <meta
          name="description"
          content="Bekijk de prijzen voor losse boardroom analyses, strategische besluitdocumenten en bestuurlijke interventies van Cyntra Insights."
        />
      </Helmet>

      <main className="marketing-readable marketing-shell overflow-hidden text-white">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.18),_transparent_28%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] py-24 md:py-32">
          <div className="marketing-container">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                Prijzen
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-7xl">
                Toegang tot Cyntra
              </h1>
              <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#D6DEE5]">
                Kies tussen losse AI-analyses en bestuurlijke interventies afhankelijk van
                beslisdruk, tempo en implementatiebehoefte.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="marketing-container">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">
                AI Analyses
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Van eerste diagnose tot expliciet besluitdocument.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {analysisPlans.map((plan) => (
                <article key={plan.label} className="marketing-card rounded-[28px] p-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">{plan.label}</p>
                  <p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p>
                  <ul className="mt-6 space-y-3 text-base text-[#D6DEE5]">
                    {plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link
                    to={plan.cta.to}
                    className={`mt-8 inline-flex px-6 py-3 text-sm ${
                      plan.cta.kind === "secondary" ? "marketing-btn-secondary" : "marketing-btn-primary"
                    }`}
                  >
                    {plan.cta.label}
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
                Bestuurlijke Interventies
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                Voor organisaties waar een rapport alleen niet genoeg is.
              </h2>
            </div>

            <article className="marketing-card mt-12 rounded-[28px] p-8">
              <p className="text-sm uppercase tracking-[0.18em] text-[#C8A96A]">{interventionPlan.label}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{interventionPlan.price}</p>
              <ul className="mt-6 space-y-3 text-base text-[#D6DEE5]">
                {interventionPlan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/contact" className="marketing-btn-primary px-6 py-3 text-sm">
                  Plan bestuurlijke intake
                </Link>
                <Link to="/aurelius" className="marketing-btn-secondary px-6 py-3 text-sm">
                  Bekijk Aurelius
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
