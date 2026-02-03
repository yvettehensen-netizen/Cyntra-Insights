import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import CyntraLogo from "@/components/CyntraLogo";

/* =====================
   ERROR MESSAGES
===================== */
const ERROR_MESSAGES = {
  empty: "Voer een toegangscode in",
  invalid: "Ongeldige of reeds gebruikte toegangscode",
  network: "Verbindingsfout. Probeer het opnieuw.",
} as const;

/* =====================
   COMPONENT
===================== */
export default function PortalAccessPage() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] =
    useState<keyof typeof ERROR_MESSAGES | null>(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     SUBMIT HANDLER
  ===================== */
  const handleSubmit = useCallback(async () => {
    const value = code.trim().toUpperCase();

    if (!value) {
      setError("empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Check invite
      const { data, error } = await supabase
        .from("invites")
        .select("id, used")
        .eq("code", value)
        .maybeSingle();

      if (error || !data || data.used) {
        setError("invalid");
        return;
      }

      // 2️⃣ Mark invite as used (CRUCIAAL)
      await supabase
        .from("invites")
        .update({ used: true })
        .eq("id", data.id);

      // 3️⃣ Grant temporary portal access
      sessionStorage.setItem("aurelius_invite", "true");

      // 4️⃣ Redirect to login
      navigate("/aurelius/login", { replace: true });

    } catch (e) {
      console.error("Invite validation error:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [code, navigate]);

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A090A] via-[#120B10] to-[#0A090A] flex items-center justify-center px-6 text-white">
      <div className="w-full max-w-md text-center space-y-10">

        {/* LOGO */}
        <CyntraLogo className="h-10 mx-auto" />

        {/* BADGE */}
        <span className="inline-block px-4 py-1 text-xs uppercase tracking-widest rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
          Besloten AI-omgeving
        </span>

        {/* TITLE */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Toegang tot{" "}
            <span className="text-[#D4AF37]">Aurelius</span>
          </h1>
          <p className="text-gray-400">
            Uitsluitend via uitnodiging of licentie
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          <input
            autoFocus
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            onKeyDown={(e) =>
              e.key === "Enter" && handleSubmit()
            }
            placeholder="TOEGANGSCODE"
            disabled={loading}
            className="
              w-full px-6 py-4 rounded-xl
              bg-black/40 border border-white/10
              text-center text-lg tracking-[0.3em] font-mono
              placeholder:text-gray-600
              focus:outline-none focus:border-[#D4AF37]
              disabled:opacity-60
            "
          />

          {error && (
            <p className="text-red-400 text-sm font-medium">
              {ERROR_MESSAGES[error]}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            className="
              w-full py-4 rounded-xl
              bg-[#D4AF37] text-black font-semibold
              hover:bg-[#e0c04a]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Controleren…" : "Toegang verifiëren"}
          </button>
        </div>

        {/* FOOTER LINK */}
        <Link
          to="/prijzen"
          className="text-sm text-gray-500 hover:text-gray-300 transition"
        >
          Geen toegangscode? Bekijk licenties →
        </Link>

      </div>
    </div>
  );
}
