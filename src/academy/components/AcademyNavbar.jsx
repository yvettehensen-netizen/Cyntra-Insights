import React from "react";
import { NavLink } from "react-router-dom";

export default function AcademyNavbar() {
  const navItems = [
    { to: "/academy", label: "🏠 Overzicht" },
    { to: "/academy/accountmanagement/dashboard", label: "📘 Mijn Trainingen" },
    { to: "/academy/accountmanagement/certificate", label: "🎓 Certificaten" },
  ];

  return (
    <nav className="bg-[#0E0E0E] border-b border-[#2A2A2A] px-6 py-4 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo / titel */}
        <NavLink
          to="/academy"
          className="text-[#D6B48E] font-playfair text-xl font-bold tracking-wide hover:opacity-90 transition"
        >
          Cyntra Academy
        </NavLink>

        {/* Navigatie links */}
        <div className="flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-[#D6B48E] border-b border-[#D6B48E]"
                    : "text-gray-400 hover:text-[#D6B48E]/80"
                } transition`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
