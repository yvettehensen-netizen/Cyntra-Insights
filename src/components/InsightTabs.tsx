import { useState } from "react";

const TABS = ["Summary", "Risks", "Actions"] as const;
type Tab = (typeof TABS)[number];

export default function InsightTabs({
  role,
}: {
  role: "EXECUTIVE" | "CONSULTANT" | "VIEWER";
}) {
  const [active, setActive] = useState<Tab>("Summary");

  return (
    <div>
      <nav className="flex gap-6 border-b border-white/10 mb-10">
        {TABS.map((tab) => {
          if (tab === "Actions" && role === "VIEWER") return null;

          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`pb-3 text-sm font-medium ${
                active === tab
                  ? "text-[#D6B48E] border-b-2 border-[#D6B48E]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {active === "Summary" && <SummarySection />}
      {active === "Risks" && <RisksSection />}
      {active === "Actions" && <ActionsSection />}
    </div>
  );
}

/* -------- Sections -------- */

function SummarySection() {
  return (
    <div className="space-y-4 text-gray-300">
      <p>
        Er is een structurele kloof tussen strategische intentie en feitelijke
        uitvoering. Richting is helder, maar vertaling naar gedrag ontbreekt.
      </p>
    </div>
  );
}

function RisksSection() {
  return (
    <ul className="list-disc ml-6 space-y-2 text-gray-300">
      <li>Besluitvorming vertraagt door impliciete machtsdynamieken</li>
      <li>Gebrek aan meetbare voortgang op executie</li>
      <li>Afhankelijkheid van individuen in plaats van systemen</li>
    </ul>
  );
}

function ActionsSection() {
  return (
    <ul className="space-y-3 text-gray-300">
      <li>• Benoem één eigenaar per strategisch thema</li>
      <li>• Introduceer expliciete besluitmomenten</li>
      <li>• Maak voortgang zichtbaar op directieniveau</li>
    </ul>
  );
}

