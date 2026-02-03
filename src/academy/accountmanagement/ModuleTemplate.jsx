import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ModuleTemplate({ module }) {
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`module-${module.id}-answers`);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, [module.id]);

  const handleChange = (index, value) => {
    const newAnswers = { ...answers, [index]: value };
    setAnswers(newAnswers);
    localStorage.setItem(`module-${module.id}-answers`, JSON.stringify(newAnswers));
  };

  useEffect(() => {
    const allAnswered = module.exercises.every((_, i) => answers[i]?.trim() !== "");
    setCompleted(allAnswered);
  }, [answers, module.exercises]);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-12 font-inter">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-[#D6B48E] mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {module.title}
        </motion.h1>

        <motion.div
          className="text-gray-300 mb-8 leading-relaxed whitespace-pre-line"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {module.theory}
        </motion.div>

        <h2 className="text-xl font-semibold text-[#D6B48E] mb-4">Reflectievragen</h2>
        <div className="space-y-6">
          {module.exercises.map((question, i) => (
            <div key={i}>
              <p className="text-gray-400 mb-2">{question}</p>
              <textarea
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#D6B48E] transition"
                rows="4"
                value={answers[i] || ""}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="Typ je antwoord hier..."
              />
            </div>
          ))}
        </div>

        {!completed && (
          <p className="text-red-400 mt-6 text-sm italic">
            ⚠️ Beantwoord alle vragen om verder te gaan.
          </p>
        )}

        {completed && (
          <motion.button
            onClick={() => setShowAI(true)}
            className="mt-8 px-6 py-3 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
            whileTap={{ scale: 0.95 }}
          >
            Toon AI Reflectie
          </motion.button>
        )}

        {showAI && (
          <motion.div
            className="mt-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-[#D6B48E] mb-3">
              AI Reflectie
            </h3>
            <p className="text-gray-400">{module.aiPrompt}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
