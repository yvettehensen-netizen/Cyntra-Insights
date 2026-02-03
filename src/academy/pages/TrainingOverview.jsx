import React from "react";
import { useParams, Link } from "react-router-dom";
import { trainings } from "../data/trainings";

export default function TrainingOverview() {
  const { trainingId } = useParams();
  const training = trainings.find((t) => t.id === trainingId);

  if (!training) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-3xl text-[#D6B48E] font-bold">Training niet gevonden</h1>
        <Link to="/academy" className="text-gray-400 underline">
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#D6B48E] mb-6">
          {training.title}
        </h1>
        <p className="text-gray-400 mb-10">{training.description}</p>

        <div className="grid gap-4">
          {training.modules.map((mod) => (
            <Link
              key={mod.id}
              to={`/academy/${training.id}/module/${mod.id}`}
              className="block p-6 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-[#D6B48E]/50 transition"
            >
              <h2 className="text-xl font-semibold text-[#D6B48E] mb-1">
                {mod.title}
              </h2>
              <p className="text-gray-400 text-sm">
                {mod.theory.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
