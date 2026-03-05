// ============================================================
// src/aurelius/layouts/CyntraAnalysisLayout.tsx
// CYNTRA COMMAND COCKPIT — EXECUTIVE / BOARDROOM GRADE
// RESTRAINED • AUTHORITATIVE • TIMELESS • SCALABLE
// ============================================================

import React from "react";

export default function CyntraAnalysisLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cyntra-shell w-full overflow-hidden font-sans">

      {/* ================= TOP BAR ================= */}
      <div className="h-14 flex items-center px-8 border-b divider-cyntra bg-cyntra-surface/90 backdrop-blur">
        <div className="text-[10px] tracking-cockpitWide uppercase text-cyntra-gold font-semibold">
          CYNTRA · AURELIUS
        </div>
        <div className="ml-auto text-[10px] tracking-cockpit text-cyntra-secondary font-semibold">
          Bestuurlijk · Vertrouwelijk
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_280px] min-h-[calc(100vh-56px)]">

        {/* ========== LEFT — CONTEXT ========== */}
        <aside className="border-b xl:border-b-0 xl:border-r divider-cyntra bg-cyntra-surface px-6 py-8">
          <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-8 font-semibold">
            Context
          </div>

          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                Analyse
              </div>
              <div className="text-cyntra-primary font-semibold text-base">
                {title}
              </div>
            </div>

            {subtitle && (
              <div>
                <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                  Doel
                </div>
                <div className="text-cyntra-secondary leading-relaxed text-sm">
                  {subtitle}
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                Status
              </div>
              <div className="flex items-center gap-2 text-cyntra-gold text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-cyntra-gold" />
                Actief
              </div>
            </div>
          </div>
        </aside>

        {/* ========== CENTER — ANALYSIS ========== */}
        <main className="relative overflow-y-auto px-6 md:px-12 py-12 bg-cyntra-primary">
          <div className="relative z-10 max-w-6xl mx-auto">
            <header className="mb-14">
              <h1 className="text-3xl font-semibold tracking-tight text-cyntra-gold normal-case">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-cyntra-secondary max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </header>

            <div className="text-[15px] leading-relaxed tracking-normal text-cyntra-primary">
              {children}
            </div>
          </div>
        </main>

        {/* ========== RIGHT — DECISION ========== */}
        <aside className="border-t xl:border-t-0 xl:border-l divider-cyntra bg-cyntra-surface px-6 py-8">
          <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-8 font-semibold">
            Besluitbeeld
          </div>

          <div className="space-y-8 text-sm">
            <div>
              <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                Vertrouwen
              </div>
              <div className="text-4xl font-semibold text-cyntra-gold">
                HIGH
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                Risiconiveau
              </div>
              <div className="text-cyntra-primary">
                MODERATE
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-cockpit uppercase text-cyntra-secondary mb-1 font-semibold">
                Sturingsmodus
              </div>
              <div className="text-cyntra-primary">
                Bestuurlijke afstemming
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
