// ============================================================
// src/aurelius/components/CyntraAnalysisFrame.tsx
// EXECUTIVE BOARDROOM DOCUMENT FRAME (MAX GRADE)
// ============================================================

import { ReactNode } from "react";

interface CyntraAnalysisFrameProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: string;
  className?: string;
}

export function CyntraAnalysisFrame({
  title,
  subtitle,
  children,
  footer = "Executive · Confidential",
  className = "",
}: CyntraAnalysisFrameProps) {
  return (
    <section
      role="document"
      aria-labelledby="analysis-title"
      className={`relative bg-[linear-gradient(180deg,var(--c-panel),var(--c-surface))] 
      border border-[var(--c-border-strong)] 
      shadow-[var(--c-shadow-hard)] 
      ${className}`}
    >
      {/* HEADER */}
      <header className="px-20 py-16 border-b border-[var(--c-border)]">
        <p className="text-[11px] uppercase tracking-[0.45em] text-[var(--c-text-muted)] mb-8">
          Strategic Analysis
        </p>

        <h1
          id="analysis-title"
          className="text-[44px] leading-[1.15] tracking-[0.16em] text-[var(--c-accent)]"
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mt-8 text-lg leading-relaxed text-[var(--c-text-secondary)] max-w-4xl">
            {subtitle}
          </p>
        )}
      </header>

      {/* BODY */}
      <div className="px-20 py-24">
        <div className="max-w-[1100px] space-y-24">
          {children}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-6 right-8 text-[10px] tracking-[0.4em] uppercase text-[var(--c-text-muted)] opacity-50">
        {footer}
      </footer>
    </section>
  );
}

