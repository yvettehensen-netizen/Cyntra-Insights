import React from "react";
import { Link } from "react-router-dom";

export const NavButtons = ({ prevModule, nextModule }) => (
  <div className="flex justify-between mt-10">
    {prevModule ? (
      <Link
        to={`/academy/accountmanagement/module/${prevModule}`}
        className="px-5 py-2 border border-[#D6B48E] text-[#D6B48E] rounded-lg hover:bg-[#D6B48E]/10 transition"
      >
        ← Vorige
      </Link>
    ) : (
      <div />
    )}

    {nextModule ? (
      <Link
        to={`/academy/accountmanagement/module/${nextModule}`}
        className="px-5 py-2 bg-[#D6B48E] text-black rounded-lg hover:bg-[#caa87f] transition"
      >
        Volgende →
      </Link>
    ) : (
      <div />
    )}
  </div>
);
