import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  Search,
  PlayCircle,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ENABLE_UNIFIED_SURFACE } from "@/config/featureFlags";

export default function AureliusNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMobileOpen(false);
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
    <header className="fixed top-0 left-0 right-0 z-[9999] border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/aurelius/control-surface" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B1538] via-[#D4AF37] to-[#8B1538] font-bold text-black">
            C
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">CYNTRA</div>
            <div className="text-[11px] text-[#D4AF37]">Executive Intelligentie Controlekamer</div>
          </div>
        </NavLink>

        <form onSubmit={handleSearch} className="mx-6 hidden max-w-md flex-1 lg:flex">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek rapporten..."
              className="w-full rounded-lg border border-white/10 bg-[#0F0F0F] px-4 py-2 text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Zoeken">
              <Search size={16} />
            </button>
          </div>
        </form>

        <nav className="hidden items-center gap-3 text-sm lg:flex">
          <NavLink to="/aurelius/control-surface" className={navClass}>
            <LayoutDashboard size={16} />
            Controlekamer
          </NavLink>

          {ENABLE_UNIFIED_SURFACE ? (
            <NavLink to="/aurelius/board-test" className={navClass}>
              <ClipboardList size={16} />
              Board Test
            </NavLink>
          ) : null}

          <NavLink to="/portal/rapporten" className={navClass}>
            <FileText size={16} />
            Rapporten
          </NavLink>

          <NavLink to="/portal/instellingen" className={navClass}>
            <Settings size={16} />
            Instellingen
          </NavLink>

          <button
            type="button"
            onClick={() => navigate("/aurelius/control-surface")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/20 px-4 py-2 text-[#F1D98C] transition hover:bg-[#D4AF37]/30"
          >
            <PlayCircle size={16} />
            Start Executive Intelligence
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </nav>

        <button onClick={() => setMobileOpen(true)} className="text-gray-300 lg:hidden" aria-label="Menu openen">
          <Menu size={24} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 p-6 lg:hidden">
          <div className="mb-6 flex justify-between">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Menu sluiten">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            <NavLink to="/aurelius/control-surface" className={navClass}>
              Controlekamer
            </NavLink>

            {ENABLE_UNIFIED_SURFACE ? (
              <NavLink to="/aurelius/board-test" className={navClass}>
                Board Test
              </NavLink>
            ) : null}

            <button
              type="button"
              onClick={() => navigate("/aurelius/control-surface")}
              className="flex w-full items-center gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/20 px-4 py-3 text-sm font-semibold text-[#F1D98C]"
            >
              <PlayCircle size={18} />
              Start Executive Intelligence
            </button>

            <NavLink to="/portal/rapporten" className={navClass}>
              Rapporten
            </NavLink>

            <NavLink to="/portal/instellingen" className={navClass}>
              Instellingen
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-red-500/10"
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
