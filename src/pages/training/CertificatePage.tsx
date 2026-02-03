import React from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "./ProgressContext";

export default function CertificatePage() {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const allCompleted = Object.keys(progress).length >= 4 && Object.values(progress).every(Boolean);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-100 flex flex-col items-center justify-center font-inter p-8">
      {allCompleted ? (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-10 text-center max-w-lg shadow-xl">
          <h1 className="text-3xl font-bold text-[#D6B48E] mb-4">
            🎓 Gefeliciteerd!
          </h1>
          <p className="text-gray-400 mb-6">
            Je hebt alle modules van de <span className="text-[#D6B48E]">Cyntra AI Accountmanagement Training</span> afgerond.
          </p>
          <a
            href="#"
            onClick={() => alert("Certificaat downloaden volgt binnenkort!")}
            className="px-8 py-3 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
          >
            Download je certificaat
          </a>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#D6B48E] mb-3">Nog even volhouden!</h2>
          <p className="text-gray-400 mb-6">
            Voltooi eerst alle 4 modules om je certificaat te ontvangen.
          </p>
          <button
            onClick={() => navigate("/training")}
            className="px-6 py-3 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
          >
            Naar de training →
          </button>
        </div>
      )}
    </div>
  );
}
