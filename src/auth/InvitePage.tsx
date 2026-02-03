// src/pages/marketing/InvitePage.tsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function InvitePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo =
    (location.state as { redirectTo?: string })?.redirectTo || "/portal";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validCodes = [
      "AURELIUS-ACCESS",
      "CYNTRA-INVITE-2025",
      "BOARD-ACCESS",
    ];

    const normalized = code.trim().toUpperCase();

    if (!validCodes.includes(normalized)) {
      setError("Ongeldige of verlopen toegangscode");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("aurelius_invite", "true");
    navigate(redirectTo, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Toegang op uitnodiging | Aurelius</title>
        <meta
          name="description"
          content="Besloten toegang tot de Aurelius Decision Engine. Alleen op uitnodiging."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0A090A] via-[#120B10] to-[#0A090A] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-black/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-14 shadow-[0_60px_140px_rgba(0,0,0,0.9)] text-center">
          <div className="w-20 h-20 mx-auto mb-10 rounded-3xl bg-[#D4AF37]/20 flex items-center justify-center">
            <Lock size={40} className="text-[#D4AF37]" />
          </div>

          <h1 className="text-3xl font-bold mb-6">Toegang op uitnodiging</h1>

          <p className="text-gray-300 mb-10">
            Aurelius is een besloten besluitomgeving.
            <br />
            Alleen toegankelijk met een geldige toegangscode.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Toegangscode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              className="w-full px-6 py-4 bg-black/40 border border-white/30 rounded-xl text-center text-lg tracking-widest placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#D4AF37] text-black font-semibold text-lg hover:brightness-110 disabled:opacity-60 transition flex items-center justify-center gap-4"
            >
              {loading ? "Controleren…" : "Ga naar portal"}
              {!loading && <ArrowRight size={22} />}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-900/20 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-300 text-sm">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <Link
            to="/"
            className="block mt-10 text-sm text-gray-400 hover:text-[#D4AF37] transition"
          >
            ← Terug naar homepage
          </Link>

          <p className="mt-6 text-xs text-gray-500">
            Geen code ontvangen? Neem contact op via info@cyntra.nl
          </p>
        </div>
      </div>
    </>
  );
}
