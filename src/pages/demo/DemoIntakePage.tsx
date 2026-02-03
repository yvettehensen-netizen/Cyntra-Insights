import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function DemoIntakePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    industry: "",
    size: "",
    challenge: "",
  });

  const canContinue =
    form.industry && form.size && form.challenge;

  const handleSubmit = () => {
    sessionStorage.setItem("cyntra_demo_context", JSON.stringify(form));
    navigate("/demo/resultaat");
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm mb-6">
          Strategische Demo
        </span>
        <h1 className="text-5xl font-bold text-white mb-6">
          Strategisch inzicht in 2 minuten
        </h1>
        <p className="text-xl text-gray-400">
          Beantwoord drie korte vragen. Zie direct hoe Cyntra
          naar jouw organisatie kijkt.
        </p>
      </div>

      <div className="space-y-10">

        {/* Branche */}
        <QuestionBlock title="In welke sector opereert je organisatie?">
          {["Zakelijke dienstverlening", "Tech / SaaS", "Industrie", "Retail", "Zorg", "Overig"].map(v => (
            <SelectButton
              key={v}
              active={form.industry === v}
              onClick={() => setForm({ ...form, industry: v })}
              label={v}
            />
          ))}
        </QuestionBlock>

        {/* Grootte */}
        <QuestionBlock title="Hoe groot is de organisatie?">
          {["1–10 medewerkers", "11–50", "51–250", "250+"].map(v => (
            <SelectButton
              key={v}
              active={form.size === v}
              onClick={() => setForm({ ...form, size: v })}
              label={v}
            />
          ))}
        </QuestionBlock>

        {/* Uitdaging */}
        <QuestionBlock title="Wat is momenteel de grootste strategische spanning?">
          {[
            "Groei stagneert",
            "Te afhankelijk van enkele klanten",
            "Besluitvorming is te traag",
            "Gebrek aan strategische focus",
            "Organisatie groeit, structuur niet"
          ].map(v => (
            <SelectButton
              key={v}
              active={form.challenge === v}
              onClick={() => setForm({ ...form, challenge: v })}
              label={v}
            />
          ))}
        </QuestionBlock>

        {/* CTA */}
        <div className="text-center pt-10">
          <button
            disabled={!canContinue}
            onClick={handleSubmit}
            className={`inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg transition
              ${
                canContinue
                  ? "bg-[#D4AF37] text-black hover:bg-[#c29a32]"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
          >
            Bekijk demo-resultaat
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/* SUBCOMPONENTS */

function QuestionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-white mb-6">
        {title}
      </h3>
      <div className="flex flex-wrap gap-4">
        {children}
      </div>
    </div>
  );
}

function SelectButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl border transition
        ${
          active
            ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
            : "border-white/10 text-gray-300 hover:border-white/30"
        }`}
    >
      {label}
    </button>
  );
}
