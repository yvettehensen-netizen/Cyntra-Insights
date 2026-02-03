import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AcademyNavbar from "../components/AcademyNavbar";
import AcademyFooter from "../components/AcademyFooter";
import { trainings } from "../data/trainings";
import { calculateTrainingProgress } from "../utils/progressUtils";
import { CircularProgress } from "../components/CircularProgress";

export default function ProgressDashboard() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const updated = {};
    trainings.forEach((t) => {
      updated[t.id] = calculateTrainingProgress(t.id, t.modules.length);
    });
    setProgress(updated);
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 font-inter pb-20">
      <AcademyNavbar />

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D6B48E] mb-6">
          Mijn Dashboard
        </h1>
        <p className="text-gray-400 mb-10">
          Bekijk je voortgang, ga verder waar je gebleven bent,  
          en behaal je certificaten.
        </p>

        {/* Trainingskaarten */}
        <div className="grid md:grid-cols-3 gap-8">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="p-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-lg hover:border-[#D6B48E]/50 transition"
            >
              <div className="flex justify-center mb-4">
                <CircularProgress progress={progress[training.id] || 0} />
              </div>

              <h2 className="text-xl font-semibold text-[#D6B48E] mb-2 text-center">
                {training.title}
              </h2>
              <p className="text-gray-400 text-sm mb-6 text-center">
                {training.description}
              </p>

              <div className="flex justify-center gap-3">
                <Link
                  to={`/academy/${training.id}/dashboard`}
                  className="px-4 py-2 bg-[#D6B48E] text-black text-sm rounded-lg font-semibold hover:bg-[#caa87f] transition"
                >
                  Open training
                </Link>
                <Link
                  to={`/academy/${training.id}/certificate`}
                  className="px-4 py-2 border border-[#D6B48E] text-[#D6B48E] text-sm rounded-lg hover:bg-[#D6B48E]/10 transition"
                >
                  Bekijk certificaat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AcademyFooter />
    </div>
  );
}
