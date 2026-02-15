// src/layouts/Footer.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ENABLE_UNIFIED_SURFACE } from "@/config/featureFlags";

import {
  Linkedin,
  Twitter,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsLoggedIn(!!session)
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <footer className="bg-[#0a080b]/95 backdrop-blur-xl border-t border-[#D4AF37]/15 mt-40">

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-4 gap-20">

          {/* --------------------------------------------------
              BRAND COLUMN
          -------------------------------------------------- */}
          <div className="space-y-8">
            <Link to="/" className="block">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#f0d68c] to-[#D4AF37] bg-clip-text text-transparent tracking-tight">
                Cyntra
              </h3>
              <p className="text-sm text-[#D4AF37]/80 font-medium mt-2">Insights</p>
            </Link>

            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              The CEO’s Brutal Truth Engine™.<br />
              Geen politieke ruis. Geen filters. Alleen radicale duidelijkheid.
            </p>

            <div className="flex items-center gap-6 text-gray-500 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs">Data direct gescrubd</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs">48 uur levertijd</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------
              OPLOSSINGEN
          -------------------------------------------------- */}
          <FooterColumn title="Oplossingen">
            {ENABLE_UNIFIED_SURFACE ? (
              <>
                <FooterLink to="/aurelius/control-surface" label="Geünificeerde controlelaag" />
                <FooterLink to="/aurelius/board-test" label="Bestuurlijke Adoptietest" />
                <FooterLink to="/aurelius/board-evaluation" label="Board Adoption & Legitimiteitsindex" />
              </>
            ) : (
              <>
                <FooterLink to="/analysis/strategy" label="Strategische Analyse" />
                <FooterLink to="/analysis/finance" label="Financiële Analyse" />
                <FooterLink to="/analysis/growth" label="Groei & Schaling" />
                <FooterLink to="/analysis/team" label="Team & Cultuur" />
                <FooterLink to="/analysis/onderstroom" label="Onderstroom Analyse" />
                <FooterLink to="/consultants" label="Volledige Analyse" />
              </>
            )}
          </FooterColumn>

          {/* --------------------------------------------------
              BEDRIJF
          -------------------------------------------------- */}
          <FooterColumn title="Bedrijf">
            <FooterLink to="/hoe-werkt-het" label="Hoe het werkt" />
            <FooterLink to="/pricing" label="Prijzen" />
            <FooterLink to="/voor-consultants" label="Voor Consultants" />
            <FooterLink to="/contact" label="Contact" />
          </FooterColumn>

          {/* --------------------------------------------------
              ACCOUNT / PORTAL
          -------------------------------------------------- */}
          <FooterColumn title={isLoggedIn ? "Portal" : "Account"}>
            {isLoggedIn ? (
              <>
                <FooterLink to="/aurelius/control-surface" label="Dashboard" />
                <FooterLink to="/portal/rapporten" label="Mijn Rapporten" />
                {!ENABLE_UNIFIED_SURFACE ? (
                  <FooterLink to="/portal/nieuwe-analyse" label="Nieuwe Analyse" />
                ) : null}
              </>
            ) : (
              <>
                <FooterLink to="/login" label="Inloggen" />
                <FooterLink to="/signup" label="Account Aanmaken" />
              </>
            )}
          </FooterColumn>

        </div>

        {/* --------------------------------------------------
            BOTTOM BAR
        -------------------------------------------------- */}
        <div className="mt-20 pt-10 border-t border-[#D4AF37]/10 flex flex-col md:flex-row justify-between items-center gap-8">

          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Cyntra Insights. Alle rechten voorbehouden.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://linkedin.com/company/cyntra-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#D4AF37] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/cyntrainsights"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#D4AF37] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* --------------------------------------------------
    SMALL COMPONENTS
-------------------------------------------------- */

function FooterColumn({ title, children }) {
  return (
    <div className="space-y-6">
      <h4 className="text-white font-semibold text-lg">{title}</h4>
      <ul className="space-y-4 text-gray-400">{children}</ul>
    </div>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-base hover:text-[#D4AF37] transition-colors duration-300"
      >
        {label}
      </Link>
    </li>
  );
}
