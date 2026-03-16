// src/layouts/PortalLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  LogOut,
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Radar,
  BookOpen,
  Database,
} from "lucide-react";
import {
  PORTAL_BENCHMARK_PATH,
  PORTAL_CASES_PATH,
  PORTAL_ANALYSIS_PATH,
  PORTAL_DATASET_PATH,
  PORTAL_DASHBOARD_PATH,
  PORTAL_INTERVENTIONS_PATH,
  PORTAL_ORGANIZATION_SCANNER_PATH,
  PORTAL_REPORT_LIBRARY_PATH,
  PORTAL_SECTOR_INSIGHTS_PATH,
  PORTAL_SETTINGS_PATH,
  PORTAL_SIGNALS_PATH,
} from "@/pages/portal/portalPaths";

export default function PortalLayout() {
  const location = useLocation();

  const navSections = [
    {
      section: "Core",
      items: [
        { to: PORTAL_DASHBOARD_PATH, label: "Dashboard", icon: LayoutDashboard },
        { to: PORTAL_ANALYSIS_PATH, label: "Strategische analyse", icon: ClipboardList },
        { to: PORTAL_REPORT_LIBRARY_PATH, label: "Rapporten", icon: FileText },
        { to: PORTAL_INTERVENTIONS_PATH, label: "Interventies", icon: BarChart3 },
      ],
    },
    {
      section: "Intelligence",
      items: [
        { to: PORTAL_CASES_PATH, label: "Historische cases", icon: BookOpen },
        { to: PORTAL_BENCHMARK_PATH, label: "Benchmark", icon: BarChart3 },
        { to: PORTAL_SECTOR_INSIGHTS_PATH, label: "Sectorinzichten", icon: BarChart3 },
        { to: PORTAL_SIGNALS_PATH, label: "Signalen", icon: Radar },
      ],
    },
    {
      section: "Data",
      items: [
        { to: PORTAL_DATASET_PATH, label: "Dataset", icon: Database },
        { to: PORTAL_ORGANIZATION_SCANNER_PATH, label: "Organisatie scanner", icon: ClipboardList },
        { to: PORTAL_SETTINGS_PATH, label: "Instellingen", icon: LayoutDashboard },
      ],
    },
  ];
  const navSectionsFlat = navSections.flatMap((group) => group.items);
  const pageTitle = (() => {
    const current = navSectionsFlat.find((item) => location.pathname.startsWith(item.to));
    return current?.label || "Dashboard";
  })();

  return (
    <div className="portal-theme portal-shell flex">
      <aside className="portal-sidebar sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto px-6 py-7 xl:block">
        <div className="mb-8">
          <NavLink to={PORTAL_DASHBOARD_PATH} className="flex items-center gap-3">
            <div className="portal-brand-mark">C</div>
            <div>
              <div className="portal-kicker">Cyntra Insights</div>
              <div className="mt-1 text-base font-semibold text-white">Aurelius Boardroom OS</div>
              <div className="mt-1 text-xs text-slate-400">Bestuurspartner voor analyse, besluit en interventie.</div>
            </div>
          </NavLink>
        </div>

        <nav className="space-y-6">
          {navSections.map((group) => (
            <section key={group.section} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`portal-nav-item text-sm ${isActive ? "portal-nav-item-active font-semibold" : ""}`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="portal-sidebar-note mt-8">
          <p className="portal-kicker">Operating Principle</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Een engine, een rapportstructuur en een portal die alleen besluitwaardige output toont.
          </p>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className="flex items-center gap-3 text-sm text-gray-400 transition hover:text-white"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <p className="portal-kicker">Cyntra Portal</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Exclusieve bestuurlijke werkomgeving voor Aurelius-analyses, interventies en signalen.
            </p>
          </div>
          <div className="portal-pill">Boardroom Intelligence</div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
