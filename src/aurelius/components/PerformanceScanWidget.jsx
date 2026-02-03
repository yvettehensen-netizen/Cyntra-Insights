import React, { useState } from "react";
import { AI_MODEL } from "../../config/aiModel";
import { motion } from "framer-motion";

export default function QuickscanWidget() {
  const [form, setForm] = useState({
    company: "",
    sector: "",
    employees: "",
    growthGoal: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const prompt = `
Bedrijf: ${form.company}
Sector: ${form.sector}
Aantal medewerkers: ${form.employees}
Belangrijkste groeidoel: ${form.growthGoal}

Maak een beknopte Quickscan-analyse van deze organisatie (max 100 woorden).
`;

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Je bent een bedrijfsanalist. Maak een korte, duidelijke samenvatting van groeikansen en digitale volwassenheid.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) throw new Error("API-fout: " + response.status);
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "Geen analyse ontvangen.";

      setResult(text);

      // Bewaar ook in Dashboard
      const saved = JSON.parse(localStorage.getItem("cyntra_analyses") || "[]");
      saved.push({
        type: "Quickscan",
        score: null,
        summary: text,
        date: new Date().toISOString(),
      });
      localStorage.setItem("cyntra_analyses", JSON.stringify(saved));
    } catch (err) {
      console.error(err);
      setError("Er ging iets mis: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 shadow-lg max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-semibold text-[#D6B48E] mb-3">
        ⚡ Quickscan (direct resultaat)
      </h2>
      <p className="text-gray-400 mb-6 text-sm">
        Vul kort je gegevens in en ontvang direct een AI-samenvatting van je groeipotentieel.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="company"
            placeholder="Bedrijfsnaam"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1A1A1A] border border-[#333] focus:border-[#D6B48E] text-sm"
            required
          />
          <input
            name="sector"
            placeholder="Sector of branche"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1A1A1A] border border-[#333] focus:border-[#D6B48E] text-sm"
            required
          />
          <input
            name="employees"
            placeholder="Aantal medewerkers"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1A1A1A] border border-[#333] focus:border-[#D6B48E] text-sm"
          />
          <input
            name="growthGoal"
            placeholder="Wat is je belangrijkste groeidoel?"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1A1A1A] border border-[#333] focus:border-[#D6B48E] text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#D6B48E] text-black px-6 py-2 rounded-lg hover:bg-[#c2a47c] font-medium"
          >
            {loading ? "Analyseren..." : "Start Quickscan"}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      ) : (
        <div className="mt-4 bg-[#1A1A1A] border border-[#333] p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
          <h3 className="text-[#D6B48E] font-semibold mb-2">Resultaat:</h3>
          {result}
          <div className="mt-4">
            <button
              onClick={() => setResult("")}
              className="px-3 py-2 border border-[#D6B48E] rounded-lg hover:bg-[#D6B48E]/10 text-xs"
            >
              Nieuwe Quickscan
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
