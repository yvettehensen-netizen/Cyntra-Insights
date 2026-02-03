// ============================================================================
// AURELIUS NAVBAR — DECISION OS READY (ADD ONLY)
// Analyses • Scans • Rapporten • Bestuur
// ============================================================================

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* ============================================================================
   CONFIG
============================================================================ */

const ANALYSES = [
  { label: "Strategie", to: "/portal/analyse/strategy" },
  { label: "Finance", to: "/portal/analyse/finance" },
  { label: "Financiële strategie", to: "/portal/analyse/financial_strategy" },
  { label: "Groei", to: "/portal/analyse/growth" },
  { label: "Markt", to: "/portal/analyse/market" },
  { label: "Processen", to: "/portal/analyse/process" },
  { label: "Leiderschap", to: "/portal/analyse/leadership" },
  { label: "Team & Cultuur", to: "/portal/analyse/team_culture" },
  { label: "Teamdynamiek", to: "/portal/analyse/team_dynamics" },
  { label: "Veranderkracht", to: "/portal/analyse/change_resilience" },
  { label: "Onderstroom", to: "/portal/analyse/onderstroom" },
  { label: "SWOT", to: "/portal/analyse/swot" },
  { label: "ESG", to: "/portal/analyse/esg" },
  { label: "AI & Data", to: "/portal/analyse/ai_data" },
  { label: "Marketing", to: "/portal/analyse/marketing" },
  { label: "Sales", to: "/portal/analyse/sales" },
];

const SCANS = [
  { label: "Zorgscan", to: "/portal/scan/zorg" },
  { label: "Overheidsscan", to: "/portal/scan/overheid" },
  { label: "Bedrijfsscan", to: "/portal/scan/bedrijf" },
];

/* ============================================================================
   COMPONENT
============================================================================ */

export default function AureliusNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMobileOpen(false);
    setAnalysisOpen(false);
    setScanOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-[#D4AF37]/15 text-[#D4AF37]"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  async function handleLogout() {
    sessionStorage.clear();
    await supabase.auth.signOut();
    navigate("/aurelius");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/portal/rapporten?query=${encodeURIComponent(search)}`);
    setSearch("");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <NavLink to="/portal/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B1538] via-[#D4AF37] to-[#8B1538] flex items-center justify-center font-bold text-black">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">CYNTRA</div>
            <div className="text-[11px] text-[#D4AF37]">
              Aurelius Decision Engine
            </div>
          </div>
        </NavLink>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 mx-6 max-w-md"
        >
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek rapporten…"
              className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-white/10 text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-4 text-sm">

          <NavLink to="/portal/dashboard" className={navClass}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>

          {/* ANALYSES */}
          <div className="relative">
            <button
              onClick={() => setAnalysisOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Analyses <ChevronDown size={14} />
            </button>

            {analysisOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#111] border border-white/10 shadow-xl p-2">
                {ANALYSES.map((a) => (
                  <NavLink
                    key={a.to}
                    to={a.to}
                    className="block px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    {a.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* 🆕 SCANS (ADD ONLY — KRITISCH) */}
          <div className="relative">
            <button
              onClick={() => setScanOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Scans <ChevronDown size={14} />
            </button>

            {scanOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#111] border border-white/10 shadow-xl p-2">
                {SCANS.map((s) => (
                  <NavLink
                    key={s.to}
                    to={s.to}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    <ClipboardCheck size={14} />
                    {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/portal/rapporten" className={navClass}>
            <FileText size={16} />
            Rapporten
          </NavLink>

          <NavLink to="/portal/instellingen" className={navClass}>
            <Settings size={16} />
            Instellingen
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </nav>

        {/* MOBILE */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden text-gray-300"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE MENU (optioneel later uitbreiden met Scans) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 p-6 lg:hidden">
          <div className="flex justify-between mb-6">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setMobileOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            <NavLink to="/portal/dashboard" className={navClass}>
              Dashboard
            </NavLink>

            <NavLink to="/portal/rapporten" className={navClass}>
              Rapporten
            </NavLink>

            <NavLink to="/portal/instellingen" className={navClass}>
              Instellingen
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Uitloggen
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
