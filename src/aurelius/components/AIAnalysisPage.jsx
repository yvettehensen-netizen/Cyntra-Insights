import React, { useState } from "react";
import { AI_MODEL } from "../../config/aiModel";
import { motion } from "framer-motion";

export default function AIAnalysisPage({ title, description, questions, promptTopic }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Main handler for AI request
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      // Build input text
      const formatted = Object.entries(form)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n");

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content: `Je bent een bedrijfsanalist gespecialiseerd in ${promptTopic}. Je schrijft duidelijke, zakelijke analyses in professionele structuur.`,
            },
            {
              role: "user",
              content: `Analyseer de volgende input:\n${formatted}\nGebruik de structuur: Inleiding, Analyse, Conclusie, Aanbevelingen.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Fout: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const aiText = data?.choices?.[0]?.message?.content;

      if (!aiText) throw new Error("Geen geldige AI response ontvangen.");

      setResult(aiText);

    } catch (err) {
      console.error(err);
      setError(err.message || "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-20 font-inter flex justify-center">
      <div className="max-w-3xl w-full">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-[#D6B48E] mb-4 font-playfair text-center"
        >
          {title}
        </motion.h1>

        <p className="text-gray-400 mb-8 text-center">{description}</p>

        {/* Form */}
        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.name}>
              <label className="block text-sm text-gray-400 mb-1">{q.label}</label>
              <textarea
                name={q.name}
                rows={2}
                onChange={handleChange}
                className="w-full p-3 rounded bg-[#1A1A1A] border border-[#333] focus:border-[#D6B48E] resize-none focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#D6B48E] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#c2a47c] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyseren..." : "Genereer Analyse"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-8"
          >
            <div className="w-10 h-10 border-4 border-[#D6B48E] border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 mt-6 text-center bg-red-900/20 p-3 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 mt-10 text-gray-300 whitespace-pre-wrap leading-relaxed"
          >
            {result}
          </motion.div>
        )}

      </div>
    </div>
  );
}
