import { Link } from "react-router-dom";

export default function StrategyPage() {
  return (
    <div className="marketing-readable min-h-screen bg-[#F5F3EE] text-[#1F2328]">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">Strategische interventie</h1>
            <p className="mt-6 text-xl text-[#3D4650]">Dominante keuze en expliciet verlies worden bestuurlijk afdwingbaar gemaakt.</p>
          </div>
          <aside className="lg:sticky lg:top-24">
            <div className="border border-[#7A5C3E]/45 bg-[#FAF8F3] p-6">
              <h3 className="text-xl font-semibold tracking-tight mb-2">Publieke vervolgstap</h3>
              <div className="space-y-3">
                <Link to="/scan" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-[#7A5C3E] text-white text-sm font-medium hover:bg-[#6A4F35] transition-colors">Start korte scan</Link>
                <Link to="/aurelius/login" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-[#7A5C3E] text-[#7A5C3E] text-sm font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Login volledig rapport</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex flex-wrap gap-4">
          <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#7A5C3E] text-white font-medium hover:bg-[#6A4F35] transition-colors">Plan een Bestuurlijke Intake</Link>
          <Link to="/aurelius" className="inline-flex items-center justify-center px-8 py-4 rounded-md border border-[#7A5C3E] text-[#7A5C3E] font-medium hover:bg-[#7A5C3E] hover:text-white transition-colors">Bekijk Aurelius</Link>
        </div>
      </section>
    </div>
  );
}
