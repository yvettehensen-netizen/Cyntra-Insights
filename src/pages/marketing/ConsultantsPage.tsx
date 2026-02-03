import React from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConsultantsPageFixed() {
  const navigate = useNavigate();

  const consultants = [
    { id: "ai-001", name: "Aurora", specialty: "AI Governance & Ethics", rating: 4.9 },
    { id: "ai-002", name: "Lyra", specialty: "Systeemoptimalisatie & Data-analyse", rating: 4.8 },
    { id: "ai-003", name: "Orion", specialty: "Strategisch Innovatieadvies", rating: 5.0 },
  ];

  return (
    <div className="p-10 space-y-8 text-gray-200 bg-[#0B0B0B] min-h-screen">
      <h1 className="text-4xl font-bold text-[#D6B48E] tracking-tight">
        AI Consultants
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {consultants.map((c) => (
          <div
            key={c.id}
            onClick={() =>
              navigate("/consultants/detail", { state: c })
            }
            className="bg-[#151515] border border-white/10 p-6 rounded-xl cursor-pointer hover:border-[#D6B48E]"
          >
            <div className="flex justify-between">
              <h2 className="text-xl text-[#D6B48E]">{c.name}</h2>
              <Sparkles size={18} />
            </div>
            <p className="text-gray-400">{c.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
