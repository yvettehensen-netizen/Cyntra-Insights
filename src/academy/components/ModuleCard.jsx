import React from "react";
import { Link } from "react-router-dom";

export const ModuleCard = ({ module, completed }) => (
  <Link to={`/academy/accountmanagement/module/${module.id}`}>
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#D6B48E]/50 transition p-5 rounded-xl shadow-lg hover:shadow-[#D6B48E]/10">
      <h3 className="text-[#D6B48E] text-xl font-semibold mb-2">{module.title}</h3>
      <p className="text-gray-400 text-sm mb-3">{module.description}</p>
      <p className={`text-sm ${completed ? "text-[#D6B48E]" : "text-gray-600"}`}>
        {completed ? "✅ Voltooid" : "Nog niet gestart"}
      </p>
    </div>
  </Link>
);
