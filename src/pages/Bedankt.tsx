import React from "react";

export default function Bedankt() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E] text-[#F8F5F2] text-center p-6">
      <h1 className="text-4xl font-playfair mb-4 gold-shine">Bedankt!</h1>
      <p className="text-lg max-w-md mb-6">
        Je bericht is succesvol verzonden. We nemen zo snel mogelijk contact
        met je op.
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-[#D6B48E] text-[#3B0E18] font-semibold rounded hover:bg-[#e9cba7] transition"
      >
        Terug naar homepage
      </a>
    </div>
  );
}
