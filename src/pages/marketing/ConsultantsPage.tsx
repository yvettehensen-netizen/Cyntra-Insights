export default function ConsultantsPage() {
  return (
    <div className="marketing-readable min-h-screen bg-[#F5F3EE] text-[#1F2328]">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">Voor interventiegedreven adviseurs</h1>
          <p className="mt-6 text-xl text-[#3D4650] max-w-3xl">
            Deze omgeving is bedoeld voor adviseurs die bestuurlijke keuzes willen forceren, niet voor zachte procesbegeleiding.
          </p>
        </div>
        <aside className="lg:sticky lg:top-24">
          <div className="border border-[#7A5C3E]/35 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-[#7A5C3E] mb-3">Portal / Login</p>
            <p className="text-sm text-[#3D4650]">Duidelijke toegang tot de besloten bestuursomgeving.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
