import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  /* EMAIL LOGIN */
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
    } else {
      navigate("/portal/dashboard");
    }

    setLoading(false);
  };

  /* GOOGLE LOGIN */
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/portal/dashboard",
      },
    });

    if (error) {
      setError("Google login mislukt");
      setLoading(false);
    }
  };

  /* RESET */
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "http://localhost:5173/login",
    });

    if (error) {
      setError("Reset mail kon niet worden verzonden");
    } else {
      setMessage("Resetlink verzonden");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-xl">

        <h1 className="text-2xl font-bold mb-6 text-center">
          {showReset ? "Wachtwoord herstellen" : "Inloggen"}
        </h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}

        {!showReset ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-white/20 rounded"
              />

              <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-white/20 rounded"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-white text-black font-bold rounded"
              >
                Inloggen
              </button>
            </form>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-4 p-3 border border-white/30 rounded"
            >
              Inloggen met Google
            </button>

            <button
              onClick={() => setShowReset(true)}
              className="mt-4 text-sm underline block mx-auto"
            >
              Wachtwoord vergeten?
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-white/20 rounded"
              />

              <button
                type="submit"
                className="w-full p-3 bg-white text-black font-bold rounded"
              >
                Reset sturen
              </button>
            </form>

            <button
              onClick={() => setShowReset(false)}
              className="mt-4 text-sm underline block mx-auto"
            >
              Terug naar login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
