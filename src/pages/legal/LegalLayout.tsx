import { NavLink, Outlet } from "react-router-dom";
import MainNavbar from "../../components/MainNavbar";
import Footer from "../../layouts/Footer";

export default function LegalLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-200">
      <MainNavbar />

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Legal navigation */}
        <nav className="flex gap-6 mb-16 border-b border-white/10 pb-4">
          <LegalLink to="/legal/security">Security</LegalLink>
          <LegalLink to="/legal/privacy">Privacy</LegalLink>
          <LegalLink to="/legal/ai-usage">AI Usage</LegalLink>
        </nav>

        {/* Page content */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function LegalLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium ${
          isActive
            ? "text-[#D6B48E]"
            : "text-gray-400 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
