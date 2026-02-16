import AnalysisDashboard from "@/components/AnalysisDashboard";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-sky-300/70">Board Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Bestuurlijke Analyse Pipeline</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Start analyses, volg status-transities, bekijk JSON-resultaten en genereer executive PDF-rapporten.
        </p>
      </header>

      <AnalysisDashboard />
    </main>
  );
}
