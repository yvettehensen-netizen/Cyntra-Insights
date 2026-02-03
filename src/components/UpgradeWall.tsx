import { Lock } from "lucide-react";

export default function UpgradeWall() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#0f0a0d] text-white px-6">
      <div className="max-w-xl text-center p-10 border border-[#D4AF37]/30 rounded-3xl bg-gradient-to-br from-[#8B1538]/20 to-black">
        <Lock className="w-12 h-12 mx-auto mb-6 text-[#D4AF37]" />

        <h2 className="text-3xl font-bold mb-4">
          Premium Insight
        </h2>

        <p className="text-gray-300 mb-8 leading-relaxed">
          Dit onderdeel bevat diepgaande strategische inzichten,
          benchmarks en aanbevelingen die alleen beschikbaar zijn
          in het volledige Aurelius rapport.
        </p>

        <button className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#c29a32] text-black font-bold rounded-xl text-lg hover:scale-105 transition">
          Unlock Full Report
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Veilig • Vertrouwelijk • Niet opgeslagen
        </p>
      </div>
    </div>
  );
}
