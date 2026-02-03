export default function HeroReportCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111] to-[#000] p-6 shadow-2xl">
      <p className="text-xs text-[#F5D66B] mb-3">Board-ready voorbeeld</p>

      <div className="space-y-4 text-xs">

        <div className="flex justify-between">
          <span className="text-gray-300">EBITDA marge (huidig)</span>
          <span className="text-red-300 font-semibold">6,1%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">EBITDA marge (doel)</span>
          <span className="text-emerald-300 font-semibold">9–11%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Cash conversion cycle</span>
          <span className="text-yellow-300 font-semibold">98 → 50 dagen</span>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] text-gray-400">
            "Binnen 48 uur een volledig rapport met prioriteiten, bedragen en onderstroom."
          </p>
        </div>
      </div>
    </div>
  );
}
