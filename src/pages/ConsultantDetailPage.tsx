import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function ConsultantDetailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const consultant = state;

  if (!consultant) {
    return (
      <div className="p-10 text-white">
        Geen consultant geselecteerd.
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6 text-white bg-[#0B0B0B] min-h-screen">
      <h1 className="text-4xl font-bold text-[#D6B48E] flex items-center gap-3">
        <Sparkles />
        {consultant.name}
      </h1>

      <p className="text-gray-400 text-lg">
        {consultant.specialty}
      </p>

      <button
        onClick={() => navigate("/consultants")}
        className="mt-6 px-6 py-3 bg-[#D6B48E] text-black rounded-lg font-semibold"
      >
        Terug naar consultants
      </button>
    </div>
  );
}
