export default function InsightsPanel() {
  return (
    <div className="lg:col-span-2 bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
      <h3 className="text-lg font-semibold text-[#D6B48E] mb-4">
        AI Insights
      </h3>

      <ul className="space-y-3 text-sm text-gray-400">
        <li>
          • Strategische focus is <span className="text-green-400">verbeterd</span> t.o.v. vorige periode
        </li>
        <li>
          • <span className="text-amber-400">Capaciteitsdruk</span> binnen kernteam vereist aandacht
        </li>
        <li>
          • Executierisico bij Q4 roadmap blijft aanwezig
        </li>
      </ul>

      <div className="mt-6 p-4 rounded-lg bg-black/30 text-sm text-gray-400">
        <strong className="text-[#D6B48E]">AI Advies:</strong><br />
        Focus de komende 30 dagen op het versimpelen van prioriteiten en het
        reduceren van strategische ruis.
      </div>
    </div>
  );
}
