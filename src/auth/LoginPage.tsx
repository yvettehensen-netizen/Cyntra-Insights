import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertTriangle, ArrowRight, Chrome } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/portal/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirectTo, { replace: true });
      setCheckingSession(false);
    });
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Onjuiste inloggegevens");
      setLoading(false);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + redirectTo },
    });

    if (error) {
      setError("Google login mislukt");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="marketing-shell flex min-h-screen items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#e8c670]" />
      </div>
    );
  }

  return (
    <main className="marketing-readable marketing-shell flex min-h-screen items-center py-16">
      <div className="marketing-container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-10 inline-flex h-24 w-24 items-center justify-center rounded-full border border-[#e8c670]/60 text-5xl font-black text-[#e8c670] glow-gold">
            C
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight">CYNTRA</h1>
          <p className="mt-2 text-xl uppercase tracking-[0.28em] text-[#b8c2d4]">Insights</p>
          <p className="mx-auto mt-8 max-w-3xl text-2xl md:text-3xl text-white">
            Besluitomgeving voor bestuur onder spanning
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl marketing-card">
          <p className="text-sm uppercase tracking-[0.16em] mb-4">Besloten Bestuurlijke Omgeving</p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="marketing-btn-primary w-full gap-3 px-6 py-4 text-lg disabled:opacity-60"
          >
            <Chrome className="h-5 w-5" />
            Betreed via Google
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e8c670]/25" />
            <p className="text-xs uppercase tracking-widest text-[#9ba5ba]">of</p>
            <div className="h-px flex-1 bg-[#e8c670]/25" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8c670]/25 bg-[#0f1629] px-4 py-3 text-[#f8f9fc] placeholder:text-[#95a1b8] focus:outline-none focus:border-[#e8c670]"
            />

            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8c670]/25 bg-[#0f1629] px-4 py-3 text-[#f8f9fc] placeholder:text-[#95a1b8] focus:outline-none focus:border-[#e8c670]"
            />

            <button
              type="submit"
              disabled={loading}
              className="marketing-btn-secondary w-full px-6 py-4 text-lg disabled:opacity-60"
            >
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#b94c4c]/40 bg-[#351923]/70 p-4 text-sm text-[#ffd8d8]">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-[#9ba5ba]">Alle activiteit wordt bestuurlijk gelogd. Mandaat is vereist.</p>
            <Link to="/" className="text-[#e8c670] hover:text-[#f1d998]">
              Terug naar homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
