// src/layouts/PortalLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
} from "lucide-react";
import CyntraLogo from "@/components/CyntraLogo";

export default function PortalLayout() {
  const location = useLocation();

  const navItems = [
    {
      to: "/portal/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/portal/rapporten",
      label: "Besluiten & Rapporten",
      icon: FileText,
    },
    {
      to: "/portal/nieuwe-analyse",
      label: "Nieuw besluit",
      icon: PlusCircle,
      primary: true,
    },
    {
      to: "/portal/instellingen",
      label: "Instellingen",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A090A] via-[#0F0E10] to-[#0B0B0B] text-white flex">
      <aside className="fixed inset-y-0 left-0 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 z-40">
        <div className="h-full px-6 py-10 flex flex-col">
          <div className="mb-12">
            <CyntraLogo className="h-9" />
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Aurelius Decision Engine™
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-4 px-5 py-3.5 rounded-xl
                    text-sm font-medium transition-all
                    ${
                      item.primary
                        ? "bg-[#D4AF37] text-black hover:bg-[#e0c04a] shadow-lg"
                        : isActive
                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
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

      <main className="ml-72 flex-1 px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

