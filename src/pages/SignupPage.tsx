import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AUTH_LOGIN_PATH, toAuthAbsolute } from "@/auth/authPaths";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: toAuthAbsolute(AUTH_LOGIN_PATH),
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setMessage("Account aangemaakt. Controleer je e-mail om te bevestigen.");
    window.setTimeout(() => {
      navigate(AUTH_LOGIN_PATH);
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0E0E0E] text-white font-inter">
      <div className="bg-[#1A1A1A] shadow-xl rounded-2xl p-10 w-full max-w-md border border-[#2A2A2A]">
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://i.ibb.co/JwjXncPj/Cyntra-Insights-1-Optimized-1-MB.png"
            alt="Cyntra Insights"
            className="w-16 mb-3"
          />
          <h2 className="text-2xl font-playfair font-bold text-[#D6B48E] mb-2 text-center">
            Maak je Cyntra-account aan
          </h2>
          <p className="text-gray-400 text-sm text-center">
            Vul je gegevens in om toegang te krijgen tot je dashboard.
          </p>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {message && <p className="text-green-400 text-center mb-4">{message}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-[#333] rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#D6B48E]"
          />
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-[#333] rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#D6B48E]"
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-[#333] rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#D6B48E]"
          />
          <input
            type="password"
            placeholder="Bevestig wachtwoord"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full p-3 border border-[#333] rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#D6B48E]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D6B48E] text-black font-semibold rounded-lg py-3 hover:bg-[#cba87f] transition"
          >
            {loading ? "Account aanmaken..." : "Account aanmaken"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <a href={AUTH_LOGIN_PATH} className="text-[#D6B48E] hover:underline">
            Al een account? Log in
          </a>
        </div>
      </div>
    </div>
  );
}
