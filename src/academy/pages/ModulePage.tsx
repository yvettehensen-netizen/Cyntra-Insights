import React from "react";
import { useParams, Link } from "react-router-dom";
import Module1 from "../accountmanagement/Module1";
import Module2 from "../accountmanagement/Module2";
import Module3 from "../accountmanagement/Module3";
import Module4 from "../accountmanagement/Module4";
import Module5 from "../accountmanagement/Module5";
import Module6 from "../accountmanagement/Module6";

export default function ModulePage() {
  const { id } = useParams();

  const modules = {
    1: <Module1 />,
    2: <Module2 />,
    3: <Module3 />,
    4: <Module4 />,
    5: <Module5 />,
    6: <Module6 />,
  };

  const moduleComponent = modules[id];

  if (!moduleComponent) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-gray-300 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#D6B48E] mb-4">
          404 – Module niet gevonden
        </h1>
        <Link
          to="/academy/accountmanagement/dashboard"
          className="px-5 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
        >
          Terug naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-10">
      {moduleComponent}
    </div>
  );
}
