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
  BarChart3,
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
    `flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
      isActive
        ? "text-cyntra-gold border-[#C4A762] bg-[#1a1f2a]"
        : "text-cyntra-secondary border-white/5 hover:text-cyntra-primary hover:bg-[#181d27]"
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
    <header className="fixed top-0 left-0 right-0 z-[9999] border-b divider-cyntra bg-[#0f131b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/aurelius/control-surface" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#d7bf84] to-[#b9924b] font-bold text-[#0F1114]">
            C
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-cyntra-primary">CYNTRA</div>
            <div className="text-[11px] text-cyntra-gold">Bestuurlijke intelligentiecontrolelaag</div>
          </div>
        </NavLink>

        <form onSubmit={handleSearch} className="mx-6 hidden max-w-md flex-1 lg:flex">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek rapporten..."
            className="w-full rounded-lg border divider-cyntra bg-[#151b27] px-4 py-2 text-cyntra-primary"
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
            <NavLink to="/aurelius/gebruikersinvoer" className={navClass}>
              <ClipboardList size={16} />
              Gebruikersinvoer
            </NavLink>
          ) : null}

          {ENABLE_UNIFIED_SURFACE ? (
            <NavLink to="/aurelius/board-evaluation" className={navClass}>
              <BarChart3 size={16} />
              Board Adoption & Legitimiteitsindex
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
            className="inline-flex items-center gap-2 rounded-lg border border-[#C4A762] bg-gradient-to-r from-[#c4a762] to-[#dcc587] px-4 py-2 text-[#0F1114] transition hover:brightness-110"
          >
            <PlayCircle size={16} />
            Start Bestuurlijke Intelligentie
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[#8B2E2E] transition hover:bg-[#8B2E2E]/10"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </nav>

        <button onClick={() => setMobileOpen(true)} className="text-cyntra-secondary lg:hidden" aria-label="Menu openen">
          <Menu size={24} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f131b] p-6 lg:hidden">
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
              <NavLink to="/aurelius/gebruikersinvoer" className={navClass}>
                Gebruikersinvoer
              </NavLink>
            ) : null}

            {ENABLE_UNIFIED_SURFACE ? (
              <NavLink to="/aurelius/board-evaluation" className={navClass}>
                Board Adoption & Legitimiteitsindex
              </NavLink>
            ) : null}

            <button
              type="button"
              onClick={() => navigate("/aurelius/control-surface")}
              className="flex w-full items-center gap-2 rounded-lg border border-[#C4A762] bg-[#C4A762] px-4 py-3 text-sm font-semibold text-[#0F1114]"
            >
              <PlayCircle size={18} />
              Start Bestuurlijke Intelligentie
            </button>

            <NavLink to="/portal/rapporten" className={navClass}>
              Rapporten
            </NavLink>

            <NavLink to="/portal/instellingen" className={navClass}>
              Instellingen
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[#8B2E2E] hover:bg-[#8B2E2E]/10"
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
