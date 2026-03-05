import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import CyntraLogo from "@/components/CyntraLogo";

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm pb-1 border-b-2 transition-colors ${
      isActive
        ? "text-cyntra-primary border-[#C4A762]"
        : "text-cyntra-secondary border-transparent hover:text-cyntra-primary/90"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b divider-cyntra bg-[#0f131b]/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <CyntraLogo className="h-9" />
        </Link>

        <div className="hidden xl:flex items-center gap-5">
          <NavLink to="/hoe-het-werkt" className={navLinkClass}>Hoe het werkt</NavLink>
          <NavLink to="/besluitdocument" className={navLinkClass}>Besluitdocument</NavLink>
          <NavLink to="/sectoren" className={navLinkClass}>Sectoren</NavLink>
          <NavLink to="/voor-consultants" className={navLinkClass}>Voor adviseurs</NavLink>
          <NavLink to="/pricing" className={navLinkClass}>Toegang</NavLink>
          <NavLink to="/prijzen" className={navLinkClass}>Prijzen</NavLink>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link to="/aurelius/login" className="btn-cyntra-secondary text-sm px-4 py-2.5">Login</Link>
          <Link to="/portal" className="btn-cyntra-secondary text-sm px-4 py-2.5">Portal</Link>
          <Link to="/scan" className="btn-cyntra-primary text-sm px-4 py-2.5">Start analyse</Link>
        </div>

        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-cyntra-primary" aria-label="Open menu">
          <Menu size={28} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#10141d] border-l divider-cyntra px-8 py-8">
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-cyntra-primary" aria-label="Sluit menu">
              <X size={28} />
            </button>

            <div className="mt-10 space-y-5 text-cyntra-primary">
              <NavLink to="/hoe-het-werkt" onClick={() => setMobileOpen(false)}>Hoe het werkt</NavLink>
              <NavLink to="/besluitdocument" onClick={() => setMobileOpen(false)}>Besluitdocument</NavLink>
              <NavLink to="/sectoren" onClick={() => setMobileOpen(false)}>Sectoren</NavLink>
              <NavLink to="/voor-consultants" onClick={() => setMobileOpen(false)}>Voor adviseurs</NavLink>
              <NavLink to="/pricing" onClick={() => setMobileOpen(false)}>Toegang</NavLink>
              <NavLink to="/prijzen" onClick={() => setMobileOpen(false)}>Prijzen</NavLink>
            </div>

            <Link to="/scan" onClick={() => setMobileOpen(false)} className="btn-cyntra-primary mt-10 w-full text-sm">
              Start analyse
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link to="/portal" onClick={() => setMobileOpen(false)} className="btn-cyntra-secondary w-full text-sm">Portal</Link>
              <Link to="/aurelius/login" onClick={() => setMobileOpen(false)} className="btn-cyntra-secondary w-full text-sm">Login</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
