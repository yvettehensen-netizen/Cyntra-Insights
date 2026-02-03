import { Link } from "react-router-dom";
import { aureliusBranding } from "../config/aureliusBranding";
import { Mail, Shield, FileText } from "lucide-react";

export default function AureliusFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B1538] to-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold text-2xl">{aureliusBranding.name}</span>
            </div>

            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              Aurelius is jouw strategische AI-partner. Geavanceerde analyses, diepgaande inzichten en uitvoerbare 90-dagen roadmaps — gebouwd voor leiders die willen winnen.
            </p>

            <p className="text-sm font-medium text-[#D4AF37] italic">
              {aureliusBranding.tagline}
            </p>
          </div>

          {/* ANALYSES */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Analyses
            </h4>
            <ul className="space-y-3 text-sm">
              {aureliusBranding.navigation.analyses.slice(0, 5).map((analysis) => (
                <li key={analysis.slug}>
                  <Link
                    to={`/aurelius/analysis/${analysis.slug}`}
                    className="hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {analysis.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RESULTS */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Voorbeelden
            </h4>
            <ul className="space-y-3 text-sm">
              {aureliusBranding.navigation.results.slice(0, 5).map((result) => (
                <li key={result.slug}>
                  <Link
                    to={`/aurelius/results/${result.slug}`}
                    className="hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {result.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL & CONTACT */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Legal & Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="flex items-center gap-3 hover:text-[#D4AF37] transition-colors duration-300 group"
                >
                  <Shield className="w-4 h-4 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="flex items-center gap-3 hover:text-[#D4AF37] transition-colors duration-300 group"
                >
                  <FileText className="w-4 h-4 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@aurelius.ai"
                  className="flex items-center gap-3 hover:text-[#D4AF37] transition-colors duration-300 group"
                >
                  <Mail className="w-4 h-4 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
                  info@aurelius.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            © {currentYear} {aureliusBranding.name} — Alle rechten voorbehouden
          </p>

          <div className="flex items-center gap-8 text-sm">
            <Link
              to="/aurelius/pricing"
              className="hover:text-[#D4AF37] transition-colors duration-300"
            >
              Pricing
            </Link>
            <Link
              to="/aurelius/portal"
              className="hover:text-[#D4AF37] transition-colors duration-300"
            >
              Portal
            </Link>
            <Link
              to="/login"
              className="hover:text-[#D4AF37] transition-colors duration-300 font-medium"
            >
              Login
            </Link>
          </div>
        </div>

        {/* TRUST BADGE */}
        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600 tracking-wide">
            Powered by Advanced AI • Enterprise-grade Security • ISO 27001 Compliant • GDPR Ready
          </p>
        </div>
      </div>
    </footer>
  );
}