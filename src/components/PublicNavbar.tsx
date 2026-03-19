import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import CyntraLogo from "@/components/CyntraLogo";

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#C8A96A]/10 bg-[#0F2A44]/82 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <CyntraLogo className="h-9" />
        </Link>

        <div className="hidden xl:flex items-center gap-5">
          <a href="/#top" className="text-sm text-[#D6DEE5] transition hover:text-white">Home</a>
          <Link to="/hoe-het-werkt" className="text-sm text-[#D6DEE5] transition hover:text-white">Hoe Cyntra werkt</Link>
          <Link to="/aurelius" className="text-sm text-[#D6DEE5] transition hover:text-white">Aurelius</Link>
          <Link to="/besluitdocument" className="text-sm text-[#D6DEE5] transition hover:text-white">Voorbeeldanalyse</Link>
          <Link to="/prijzen" className="text-sm text-[#D6DEE5] transition hover:text-white">Prijzen</Link>
          <Link to="/contact" className="text-sm text-[#D6DEE5] transition hover:text-white">Contact</Link>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link
            to="/aurelius/login"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Plan intake
          </Link>
          <Link
            to="/scan"
            className="inline-flex items-center justify-center rounded-full bg-[#C8A96A] px-5 py-2.5 text-sm font-semibold text-[#0F2A44] transition hover:bg-[#d7b97e]"
          >
            Start analyse
          </Link>
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
              <a href="/#top" onClick={() => setMobileOpen(false)}>Home</a>
              <Link to="/hoe-het-werkt" onClick={() => setMobileOpen(false)}>Hoe Cyntra werkt</Link>
              <Link to="/aurelius" onClick={() => setMobileOpen(false)}>Aurelius</Link>
              <Link to="/besluitdocument" onClick={() => setMobileOpen(false)}>Voorbeeldanalyse</Link>
              <Link to="/prijzen" onClick={() => setMobileOpen(false)}>Prijzen</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>

            <Link
              to="/aurelius/login"
              onClick={() => setMobileOpen(false)}
              className="mt-10 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Plan intake
            </Link>
            <Link
              to="/scan"
              onClick={() => setMobileOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#C8A96A] px-5 py-3 text-sm font-semibold text-[#0F2A44]"
            >
              Start analyse
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
