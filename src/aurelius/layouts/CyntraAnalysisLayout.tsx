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
    <div className="min-h-screen w-full bg-[#05060a] text-[#EDEDED] overflow-hidden font-sans">

      {/* ================= TOP BAR ================= */}
      <div className="h-14 flex items-center px-8 border-b border-white/5 bg-[#07080d]/95 backdrop-blur">
        <div className="text-[10px] tracking-cockpitWide uppercase text-gold font-medium">
          CYNTRA · AURELIUS
        </div>
        <div className="ml-auto text-[9px] tracking-cockpit text-white/40">
          EXECUTIVE · CONFIDENTIAL
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-[300px_1fr_340px] min-h-[calc(100vh-56px)]">

        {/* ========== LEFT — CONTEXT ========== */}
        <aside className="border-r border-white/5 bg-[#07080d] px-6 py-8">
          <div className="text-[9px] tracking-cockpit uppercase text-white/30 mb-8">
            CONTEXT
          </div>

          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                MODULE
              </div>
              <div className="text-gold font-medium text-base">
                {title}
              </div>
            </div>

            {subtitle && (
              <div>
                <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                  OBJECTIVE
                </div>
                <div className="text-white/60 leading-relaxed text-sm">
                  {subtitle}
                </div>
              </div>
            )}

            <div>
              <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                STATUS
              </div>
              <div className="flex items-center gap-2 text-[#4ade80] text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                ONLINE
              </div>
            </div>
          </div>
        </aside>

        {/* ========== CENTER — ANALYSIS ========== */}
        <main className="relative overflow-y-auto px-16 py-14 bg-[#0b0d14]">

          {/* Ambient light */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 blur-[280px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <header className="mb-14">
              <h1 className="text-2xl font-semibold tracking-wide text-gold uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-white/50 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </header>

            <div className="font-mono text-[14px] leading-relaxed tracking-wide">
              {children}
            </div>
          </div>
        </main>

        {/* ========== RIGHT — DECISION ========== */}
        <aside className="border-l border-white/5 bg-[#07080d] px-6 py-8">
          <div className="text-[9px] tracking-cockpit uppercase text-white/30 mb-8">
            DECISION
          </div>

          <div className="space-y-8 text-sm">
            <div>
              <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                CONFIDENCE
              </div>
              <div className="text-4xl font-semibold text-gold">
                HIGH
              </div>
            </div>

            <div>
              <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                RISK
              </div>
              <div className="text-white/60">
                MODERATE
              </div>
            </div>

            <div>
              <div className="text-[9px] tracking-cockpit uppercase text-white/40 mb-1">
                MODE
              </div>
              <div className="text-white/60">
                STRATEGIC ALIGNMENT
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
