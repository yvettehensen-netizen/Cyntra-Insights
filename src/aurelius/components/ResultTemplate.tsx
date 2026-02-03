import { ReactNode } from "react";
import UpgradeWall from "../../components/UpgradeWall";
import Watermark from "./Watermark";
import { ReportSecurity } from "../../types/reportAccess";

export interface ResultTemplateProps {
  title: string;
  subtitle?: string;
  badge?: string;
  visualImage?: string;
  children: ReactNode;

  // Security & monetization
  security?: ReportSecurity;
  isPremiumUser?: boolean;
}

export default function ResultTemplate({
  title,
  subtitle,
  badge,
  visualImage,
  children,
  security,
  isPremiumUser = false,
}: ResultTemplateProps) {
  // -------------------------------------------------
  // PREMIUM GATING
  // -------------------------------------------------
  if (security?.access === "premium" && !isPremiumUser) {
    return <UpgradeWall />;
  }

  // -------------------------------------------------
  // RENDER REPORT
  // -------------------------------------------------
  return (
    <div className="relative min-h-screen bg-[#0f0a0d] text-gray-100 px-6 py-16">
      {/* SECURITY WATERMARK */}
      {security?.watermark && (
        <Watermark text="CONFIDENTIAL — CYNTRA INSIGHTS" />
      )}

      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-16">
        {badge && (
          <span
            className="
              inline-block mb-6 px-5 py-2
              rounded-full text-xs font-semibold tracking-widest uppercase
              bg-[#8B1538]/20 text-[#D4AF37]
              border border-[#D4AF37]/30
            "
          >
            {badge}
          </span>
        )}

        <h1 className="text-5xl font-bold mb-4 leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xl text-gray-400 max-w-3xl">
            {subtitle}
          </p>
        )}
      </header>

      {/* HERO VISUAL */}
      {visualImage && (
        <div className="max-w-6xl mx-auto mb-20">
          <img
            src={visualImage}
            alt={title}
            className="w-full rounded-2xl border border-white/10"
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto space-y-24">
        {children}
      </main>

      {/* SECURITY FOOTER */}
      <footer className="max-w-6xl mx-auto mt-24 text-xs text-gray-500 leading-relaxed">
        This analysis was generated from transient input and processed in a
        secured environment. No source data is stored or retrievable after
        session termination.
      </footer>
    </div>
  );
}
