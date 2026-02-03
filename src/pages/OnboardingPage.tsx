import React, { useState } from "react";

export default function OnboardingPage({ navigate }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    console.log("Nieuwe lead:", form);
    navigate("quickscan");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3B0E18] text-[#F8F5F2] p-6">
      <div className="bg-[#7C1F33]/80 p-8 rounded-2xl border border-[#D6B48E]/30 max-w-md w-full shadow-[0_0_25px_rgba(214,180,142,0.2)]">
        <h1 className="text-3xl font-playfair text-[#D6B48E] mb-4">
          Begin met je Quickscan
        </h1>
        <p className="text-sm text-[#F8F5F2]/70 mb-6">
          Vul je gegevens in om toegang te krijgen tot je gepersonaliseerde AI-analyse.
        </p>

        <input
          name="name"
          placeholder="Naam"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 p-3 rounded bg-[#2A0E15] border border-[#D6B48E]/30 text-[#F8F5F2]"
        />
        <input
          name="email"
          placeholder="E-mailadres"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-3 rounded bg-[#2A0E15] border border-[#D6B48E]/30 text-[#F8F5F2]"
        />
        <input
          name="company"
          placeholder="Bedrijfsnaam"
          value={form.company}
          onChange={handleChange}
          className="w-full mb-5 p-3 rounded bg-[#2A0E15] border border-[#D6B48E]/30 text-[#F8F5F2]"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-[#D6B48E] text-[#2A0E15] py-3 rounded-lg font-semibold hover:bg-[#e9cba7] transition"
        >
          Volgende ➜
        </button>
      </div>
    </div>
  );
}
