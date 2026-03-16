import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { PEM_SCANS, ACCENT_STYLES, isCoreFit } from "./pem/pemScanConfig";

export default function PemFitsHubPage() {
  const scans = PEM_SCANS.filter((scan) => isCoreFit(scan.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Cyntra Fits
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">
            De kernsuite voor scherpte in mens, team en leiderschap
          </h1>
          <p className="text-lg text-white/60 max-w-3xl">
            Deze drie kernscans zijn het fundament. Ze maken spanning zichtbaar,
            vertalen het naar VRR, en leveren één scherpe diagnose per laag —
            zonder ruis of therapietaal.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scans.map((scan) => {
            const accent = ACCENT_STYLES[scan.accent];
            return (
              <Link
                key={scan.id}
                to={`/portal/fits/${scan.id}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-white/20 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3 text-white/60 text-xs uppercase tracking-widest">
                  <Sparkles className={`h-4 w-4 ${accent.accentText}`} />
                  {scan.tagline}
                </div>
                <h2 className={`mt-4 text-2xl font-semibold ${accent.accentTextStrong}`}>
                  {scan.label}
                </h2>
                <p className="mt-3 text-white/60 leading-relaxed">
                  {scan.description}
                </p>
                <div className={`mt-6 text-sm font-semibold ${accent.accentText}`}>
                  Start scan →
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
