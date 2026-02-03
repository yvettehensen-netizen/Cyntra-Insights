import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { trainings } from "../data/trainings";

// ✅ Gebruik de eerste training (je kunt later meerdere toevoegen)
const training = trainings[0];
const modules = training.modules;

export default function ProgressDashboard() {
  const [progress, setProgress] = useState({});
  const [lastVisited, setLastVisited] = useState(null);

  useEffect(() => {
    const newProgress = {};
    modules.forEach((m) => {
      const saved = localStorage.getItem(`module-${m.id}-answers`);
      const answers = saved ? JSON.parse(saved) : {};
      const completed = m.reflections
        ? m.reflections.every((_, i) => answers[i]?.trim() !== "")
        : false;
      newProgress[m.id] = completed;
    });
    setProgress(newProgress);

    // 🧭 Haal laatste bezochte module op
    const last = localStorage.getItem("last-module");
    if (last) setLastVisited(last);
  }, []);

  const total = modules.length;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const percentage = Math.round((completedCount / total) * 100);

  const handleReset = () => {
    if (confirm("Weet je zeker dat je al je voortgang wilt wissen?")) {
      modules.forEach((m) =>
        localStorage.removeItem(`module-${m.id}-answers`)
      );
      localStorage.removeItem("last-module");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-12 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* ✅ Titel en beschrijving */}
        <motion.h1
          className="text-3xl font-bold mb-4"
          style={{ color: training.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {training.title}
        </motion.h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          {training.description}
        </p>

        {/* ✅ Voortgangsbalk */}
        <div className="w-full bg-[#1A1A1A] rounded-full h-4 mb-8 border border-[#2A2A2A]">
          <motion.div
            className="h-4 rounded-full"
            style={{ backgroundColor: training.color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <p className="text-sm text-gray-400 mb-10 text-right">
          {completedCount} van {total} modules afgerond ({percentage}%)
        </p>

        {/* 🧭 Doorgaan waar je gebleven was */}
        {lastVisited && (
          <div className="mb-10 text-center">
            <Link
              to={`/academy/accountmanagement/module/${lastVisited}`}
              className="px-5 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
            >
              Ga verder met module {lastVisited} →
            </Link>
          </div>
        )}

        {/* 📘 Modules */}
        <div className="space-y-6">
          {modules.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-6 transition ${
                progress[m.id]
                  ? "border-[#D6B48E]/60 bg-[#1A1A1A]"
                  : "border-[#2A2A2A] bg-[#0E0E0E]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#D6B48E] mb-1">
                    Module {m.id}: {m.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                    {m.theory[0]} {/* eerste theoriezin als preview */}
                  </p>
                </div>

                <Link
                  to={`/academy/accountmanagement/module/${m.id}`}
                  onClick={() => localStorage.setItem("last-module", m.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                    progress[m.id]
                      ? "bg-[#D6B48E] text-black hover:bg-[#caa87f]"
                      : "border border-[#D6B48E] text-[#D6B48E] hover:bg-[#D6B48E]/10"
                  }`}
                >
                  {progress[m.id] ? "Bekijk opnieuw" : "Start module"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 🧾 Certificaatmelding */}
        {percentage === 100 && (
          <motion.div
            className="mt-10 p-4 border border-[#D6B48E]/60 rounded-lg text-center text-[#D6B48E]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🎉 Gefeliciteerd! Je hebt alle modules voltooid. <br />
            <Link
              to="/academy/accountmanagement/certificate"
              className="underline hover:text-[#caa87f]"
            >
              Download je certificaat →
            </Link>
          </motion.div>
        )}

        {/* 🧹 Resetknop */}
        <div className="mt-10 text-center">
          <button
            onClick={handleReset}
            className="text-gray-500 text-sm underline hover:text-gray-300"
          >
            Wis mijn voortgang
          </button>
        </div>
      </div>
    </div>
  );
}
