// src/layouts/PortalLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  LogOut,
  LayoutDashboard,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function PortalLayout() {
  const location = useLocation();

  const navSections = [
    {
      section: "Analyse",
      items: [
        { to: "/portal/saas/analyse", label: "Strategische analyse", icon: ClipboardList },
        { to: "/portal/saas/rapporten", label: "Strategische rapporten", icon: FileText },
        { to: "/portal/saas/interventies", label: "Interventies", icon: BarChart3 },
      ],
    },
    {
      section: "Intelligence",
      items: [
        { to: "/portal/saas/cases", label: "Historische cases", icon: FileText },
        { to: "/portal/saas/benchmark", label: "Benchmark", icon: BarChart3 },
        { to: "/portal/saas/branche-analyse", label: "Branche analyse", icon: BarChart3 },
        { to: "/portal/saas/sector-radar", label: "Sector Radar", icon: BarChart3 },
        { to: "/portal/saas/signalen", label: "Signalen", icon: BarChart3 },
        { to: "/portal/saas/voorspellingen", label: "Voorspellingen", icon: ClipboardList },
      ],
    },
    {
      section: "Organisatie",
      items: [
        { to: "/portal/saas/organisatie-scanner", label: "Organisatie scanner", icon: ClipboardList },
        { to: "/portal/saas/dataset", label: "Dataset", icon: FileText },
      ],
    },
    {
      section: "AI",
      items: [
        { to: "/portal/saas/strategy-copilot", label: "Strategy Copilot", icon: ClipboardList },
        { to: "/portal/saas/autopilot", label: "Autopilot", icon: LayoutDashboard },
        { to: "/portal/saas/ai-agent", label: "AI Agent", icon: LayoutDashboard },
      ],
    },
    {
      section: "Boardroom",
      items: [
        { to: "/portal/saas/besluit-simulator", label: "Besluit simulator", icon: ClipboardList },
        { to: "/portal/saas/boardroom", label: "Boardroom", icon: FileText },
        { to: "/portal/saas/strategische-kennis", label: "Strategische kennis", icon: BarChart3 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A090A] via-[#0F0E10] to-[#0B0B0B] text-white flex">
      <aside className="fixed top-0 bottom-0 left-0 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 z-40">
        <div className="h-full px-6 py-10 flex flex-col">
          <div className="mb-12">
            <NavLink to="/portal/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#d7bf84] to-[#b9924b] font-bold text-[#0F1114]">
                C
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-cyntra-primary">CYNTRA</div>
                <div className="text-[11px] text-cyntra-gold">
                  Bestuurlijke intelligentiecontrolelaag
                </div>
              </div>
            </NavLink>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
            <NavLink
              to="/portal/saas"
              className={`
                flex items-center gap-4 px-5 py-3.5 rounded-xl
                text-sm font-medium transition-all
                ${
                  location.pathname === "/portal/saas"
                    ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <LayoutDashboard size={18} />
              <span>CYNTRA</span>
            </NavLink>

            {navSections.map((group) => (
              <section key={group.section} className="space-y-1">
                <p className="px-5 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  {group.section}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`
                        flex items-center gap-4 px-5 py-3 rounded-xl
                        text-sm font-medium transition-all
                        ${
                          isActive
                            ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </section>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/aurelius";
              }}
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition"
            >
              <LogOut size={16} />
              Uitloggen
            </button>

            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Cyntra Insights
            </p>
          </div>
        </div>
      </aside>

      <main className="ml-72 flex-1 px-10 py-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
