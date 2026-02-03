import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AcademyNavbar from "../components/AcademyNavbar";
import AcademyFooter from "../components/AcademyFooter";
import ProgressBar from "../components/ProgressBar";
import { trainings } from "../data/trainings";
import { calculateTrainingProgress } from "../utils/progressUtils";

export default function AcademyOverview() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const newProgress = {};
    trainings.forEach((t) => {
      newProgress[t.id] = calculateTrainingProgress(t.id, t.modules.length);
    });
    setProgress(newProgress);
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 font-inter pb-20">
      <AcademyNavbar />

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D6B48E] mb-6">
          Cyntra Academy
        </h1>
        <p className="text-gray-400 mb-8 max-w-3xl">
          Ontdek trainingen gericht op groei, leiderschap en AI-integratie.  
          Kies jouw traject en start vandaag nog met leren.
        </p>

        {trainings.map((training) => (
          <div key={training.id} className="mb-16">
            <h2 className="text-2xl font-semibold text-[#D6B48E] mb-4">
              {training.title}
            </h2>
            <p className="text-gray-400 mb-6">{training.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <ProgressBar progress={progress[training.id] || 0} />
              <span className="text-sm text-gray-400 min-w-[60px] text-right">
                {progress[training.id] || 0}%
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {training.modules.map((module) => (
                <div
                  key={module.id}
                  className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl hover:border-[#D6B48E]/50 transition"
                >
                  <h3 className="text-lg font-semibold text-[#D6B48E] mb-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                    {module.theory.slice(0, 120)}...
                  </p>
                  <Link
                    to={`/academy/${training.id}/module/${module.id}`}
                    className="text-[#D6B48E] text-sm font-medium hover:underline"
                  >
                    Open module →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AcademyFooter />
    </div>
  );
}

