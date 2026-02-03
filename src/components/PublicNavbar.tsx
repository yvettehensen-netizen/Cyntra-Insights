// src/components/PublicNavbar.tsx
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import CyntraLogo from "@/components/CyntraLogo";

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scansOpen, setScansOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `
      transition font-medium
      ${isActive ? "text-white" : "text-gray-300 hover:text-white"}
    `;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <CyntraLogo className="h-10" />
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden lg:flex items-center gap-10 text-base relative">
          <NavLink to="/hoe-het-werkt" className={navLinkClass}>
            Hoe het werkt
          </NavLink>

          <NavLink to="/demo" className={navLinkClass}>
            Demo
          </NavLink>

          <NavLink to="/prijzen" className={navLinkClass}>
            Prijzen
          </NavLink>

          <NavLink to="/voor-consultants" className={navLinkClass}>
            Voor consultants
          </NavLink>

          <NavLink to="/aurelius" className={navLinkClass}>
            Aurelius
          </NavLink>

          {/* ================= SCANS DROPDOWN ================= */}
          <div className="relative">
            <button
              onClick={() => setScansOpen((v) => !v)}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition"
            >
              Scans
              <ChevronDown className="h-4 w-4" />
            </button>

            {scansOpen && (
              <div
                onMouseLeave={() => setScansOpen(false)}
                className="absolute top-full mt-4 w-80 rounded-2xl border border-white/10 bg-black/95 shadow-2xl p-4 space-y-3"
              >
                {/* ✅ ACTIVE SCAN */}
                <ScanItem
                  title="ZorgScan™"
                  subtitle="Zorg & GGZ"
                  description="Waar besluitvorming in zorg structureel verdwijnt."
                  href="/zorgscan"
                  active
                />

                {/* FUTURE SCANS (LOCKED) */}
                <ScanItem
                  title="Scale-up Scan™"
                  subtitle="Start-ups & Scale-ups"
                  description="Waar groei stokt door onduidelijke eigenaarschap."
                />

                <ScanItem
                  title="BoardScan™"
                  subtitle="Corporates & RvB"
                  description="Waar boardroom-besluiten blijven hangen."
                />

                <ScanItem
                  title="FamilieScan™"
                  subtitle="Familiebedrijven"
                  description="Waar macht, loyaliteit en governance botsen."
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= DESKTOP CTA ================= */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/portal/dashboard" // ✅ ADD ONLY — Canonical Portal Entry Fix
            className="
              inline-flex items-center gap-2
              px-8 py-3 rounded-full
              bg-[#D4AF37] text-black font-bold
              hover:bg-[#e0c04a]
              transition-all
            "
          >
            Portal
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* ================= MOBILE TOGGLE ================= */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden text-white"
          aria-label="Open menu"
        >
          <Menu size={32} />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-black/95 z-50 px-8 py-10 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-white"
              aria-label="Sluit menu"
            >
              <X size={32} />
            </button>

            <div className="mt-10 space-y-6 text-lg">
              <NavLink to="/hoe-het-werkt" onClick={() => setMobileOpen(false)}>
                Hoe het werkt
              </NavLink>
              <NavLink to="/demo" onClick={() => setMobileOpen(false)}>
                Demo
              </NavLink>
              <NavLink to="/prijzen" onClick={() => setMobileOpen(false)}>
                Prijzen
              </NavLink>
              <NavLink
                to="/voor-consultants"
                onClick={() => setMobileOpen(false)}
              >
                Voor consultants
              </NavLink>
              <NavLink to="/aurelius" onClick={() => setMobileOpen(false)}>
                Aurelius
              </NavLink>

              <div className="pt-6 border-t border-white/10">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-3">
                  Scans
                </p>

                {/* ✅ ONLY ACTIVE PUBLIC SCAN */}
                <Link to="/zorgscan" onClick={() => setMobileOpen(false)}>
                  ZorgScan™
                </Link>

                <p className="text-white/20 text-sm mt-2">
                  Meer sector-scans volgen.
                </p>
              </div>
            </div>

            <Link
              to="/portal/dashboard" // ✅ ADD ONLY — Mobile Portal Fix
              onClick={() => setMobileOpen(false)}
              className="
                mt-auto inline-flex justify-center items-center gap-2
                w-full px-10 py-4 rounded-full
                bg-[#D4AF37] text-black font-bold
              "
            >
              Portal
              <ArrowRight size={18} />
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}

/* ================= SCAN ITEM ================= */

function ScanItem({
  title,
  subtitle,
  description,
  href,
  active,
}: {
  title: string;
  subtitle: string;
  description: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={`rounded-xl p-4 transition ${
        active
          ? "border border-[#d4af37]/40 hover:bg-white/5"
          : "opacity-40 cursor-not-allowed"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-white/30">
        {subtitle}
      </p>
      <p className="text-sm font-semibold text-[#d4af37] mt-1">{title}</p>
      <p className="text-xs text-white/40 mt-1">{description}</p>
    </div>
  );

  if (active && href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
