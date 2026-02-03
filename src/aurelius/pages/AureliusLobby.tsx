// src/aurelius/pages/AureliusLobby.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AureliusLobby() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ haal redirect uit state
  const stateRedirect =
    (location.state as { redirectTo?: string })?.redirectTo;

  // 2️⃣ sla redirect op (cruciaal!)
  useEffect(() => {
    if (stateRedirect) {
      sessionStorage.setItem("aurelius_redirect", stateRedirect);
    }
  }, [stateRedirect]);

  // 3️⃣ fallback
  const redirectTo =
    sessionStorage.getItem("aurelius_redirect") || "/portal";

  const handleAccess = () => {
    if (!code.trim() || loading) return;

    setLoading(true);

    setTimeout(() => {
      sessionStorage.setItem("aurelius_access", "true");
      setLoading(false);
      navigate(redirectTo, { replace: true });
    }, 1200);
  };

  return (
    <>
      <Helmet>
        <title>Aurelius Portal | Cyntra Insights</title>
        <meta
          name="description"
          content="Besloten strategische analyseomgeving voor directies en executives."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="max-w-xl w-full bg-black/60 border border-white/20 rounded-3xl p-16 text-center">
          <Lock size={48} className="mx-auto mb-8 text-[#D4AF37]" />

          <h1 className="text-5xl font-bold mb-6">
            Aurelius <span className="text-[#D4AF37]">Portal</span>
          </h1>

          <p className="text-gray-300 mb-12">
            Besloten strategische analyseomgeving.
          </p>

          <div className="flex justify-center gap-10 mb-10 text-gray-400">
            <TrustItem icon={<Shield size={28} />} label="Privé" />
            <TrustItem icon={<Zap size={28} />} label="EU-hosting" />
            <TrustItem icon={<Users size={28} />} label="Invite-only" />
          </div>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAccess()}
            placeholder="Toegangscode"
            className="w-full px-6 py-4 rounded-xl bg-black border border-white/30 mb-6"
          />

          <button
            onClick={handleAccess}
            disabled={!code.trim() || loading}
            className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl"
          >
            {loading ? "Controleren…" : "Ga naar portal"}
          </button>

          <Link to="/" className="block mt-8 text-gray-400">
            ← Terug naar homepage
          </Link>
        </div>
      </div>
    </>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      {icon}
      <p className="text-sm mt-2">{label}</p>
    </div>
  );
}

