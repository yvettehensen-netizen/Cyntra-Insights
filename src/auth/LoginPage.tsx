// src/pages/auth/LoginPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  AlertTriangle,
  ArrowRight,
  Chrome,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ============================================================
     ✅ ADD ONLY — REDIRECT CANON
     If user came from ZorgScan, return them there after login
  ============================================================ */
  const redirectTo =
    (location.state as any)?.from || "/portal/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ============================================================
     ✅ SESSION CHECK — ALREADY LOGGED IN
  ============================================================ */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate(redirectTo, { replace: true });
      }
      setCheckingSession(false);
    });
  }, [navigate, redirectTo]);

  /* ============================================================
     ✅ EMAIL/PASSWORD LOGIN
  ============================================================ */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Onjuiste inloggegevens");
      setLoading(false);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  /* ============================================================
     ✅ GOOGLE LOGIN (SUPABASE OAUTH)
  ============================================================ */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + redirectTo,
      },
    });

    if (error) {
      setError("Google login mislukt");
      setLoading(false);
    }
  };

  /* ============================================================
     ✅ LOADING STATE
  ============================================================ */
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={52} className="text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  /* ============================================================
     ✅ UI — BOARDROOM LOGIN
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] flex items-center justify-center px-6 text-white">
      <div className="max-w-sm w-full bg-black/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 shadow-2xl space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Aurelius <span className="text-[#D4AF37]">Portal</span>
          </h1>

          <p className="text-xs uppercase tracking-widest text-white/30">
            Secure Boardroom Access
          </p>
        </div>

        {/* ======================================================
            ✅ GOOGLE LOGIN BUTTON
        ====================================================== */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-3
            py-4 rounded-2xl
            border border-white/20
            text-white/80
            hover:border-[#D4AF37]/60
            hover:text-[#D4AF37]
            transition
          "
        >
          <Chrome className="h-5 w-5" />
          Login met Google
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* OR DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-xs text-white/20 uppercase tracking-widest">
            of
          </p>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* ======================================================
            ✅ EMAIL LOGIN FORM
        ====================================================== */}
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-2xl placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />

          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-2xl placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-2xl
              bg-[#D4AF37] text-black font-bold
              hover:scale-[1.02]
              transition
              disabled:opacity-60
            "
          >
            {loading ? "Bezig…" : "Inloggen"}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-600/60 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* BACK LINK */}
        <Link
          to="/"
          className="block text-center text-gray-400 hover:text-[#D4AF37]"
        >
          ← Terug naar homepage
        </Link>
      </div>
    </div>
  );
}
