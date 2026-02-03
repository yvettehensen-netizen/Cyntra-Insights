import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Quickscan() {
  return (
    <div className="relative bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] border border-white/10 rounded-3xl p-10 overflow-hidden">
      
      {/* subtle glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F5D66B]/10 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-3xl">

        {/* badge row */}
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5D66B]/10 border border-[#F5D66B]/30 text-[#F5D66B] text-xs font-semibold">
            <Sparkles size={12} />
            GRATIS QUICKSCAN
          </span>
          <span className="text-xs text-gray-400">
            ± 5 minuten • Direct resultaat
          </span>
        </div>

        {/* headline */}
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
          Ontvang binnen 5 minuten  
          <span className="block text-[#F5D66B]">
            strategische helderheid
          </span>
        </h2>

        {/* body copy */}
        <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
          Beantwoord 5 gerichte vragen en ontvang direct een eerste,
          objectieve indicatie van je strategische positie — inclusief
          <strong className="text-white font-medium"> belangrijkste risico’s, kansen</strong>{" "}
          en concrete prioriteiten.
        </p>

        {/* bullet proof points */}
        <ul className="mb-8 space-y-2 text-sm text-gray-300">
          <li>• Strategische score & positionering</li>
          <li>• Top 3 aandachtspunten voor groei</li>
          <li>• Eerste quick wins (high-level)</li>
        </ul>

        {/* CTA */}
        <Link
          to="/quickscan-gratis"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#F5D66B] text-black text-sm font-semibold hover:bg-[#f5ca4c] transition shadow-lg shadow-[#F5D66B]/20"
        >
          Start gratis quickscan
          <ArrowRight size={16} />
        </Link>

        {/* trust line */}
        <div className="mt-4 text-xs text-gray-500">
          Geen account • Geen creditcard • Volledig vrijblijvend
        </div>
      </div>
    </div>
  );
}
