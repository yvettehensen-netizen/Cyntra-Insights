import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AUTH_LOGIN_PATH, toAuthAbsolute } from "@/auth/authPaths";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: toAuthAbsolute(AUTH_LOGIN_PATH),
    });

    setLoading(false);

    if (error) setError(error.message);
    else setMessage("Check je e-mail voor een herstel-link.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-background text-brand-text font-inter">
      <div className="bg-brand-surface shadow-soft rounded-2xl p-8 w-96 border border-brand-accent/10">
        <h2 className="text-2xl font-playfair mb-4 text-brand-accent text-center">
          🔁 Wachtwoord herstellen
        </h2>

        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-brand-accent/20 rounded-lg bg-transparent text-brand-text focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent text-brand-primary rounded-lg py-2 hover:bg-brand-light transition"
          >
            {loading ? "Versturen..." : "Verzend herstel-link"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <a href={AUTH_LOGIN_PATH} className="text-brand-accent hover:underline">
            Terug naar inloggen
          </a>
        </div>
      </div>
    </div>
  );
}
