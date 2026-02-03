import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/layouts/Footer";
import { ArrowRight } from "lucide-react";

export default function StrategischIntakePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    doelen: "",
    uitdagingen: "",
    team: "",
    markt: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    navigate("/rapport/strategisch");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <MainNavbar />

      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Strategisch Intake</h1>

        <div className="space-y-6">
          {[
            { key: "doelen", label: "Wat zijn je doelen?" },
            { key: "uitdagingen", label: "Wat zijn je uitdagingen?" },
            { key: "team", label: "Hoe presteert je team?" },
            { key: "markt", label: "Beschrijf je marktpositie." },
          ].map((q) => (
            <div key={q.key}>
              <label className="text-gray-300">{q.label}</label>
              <textarea
                name={q.key}
                value={form[q.key]}
                onChange={handleChange}
                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 mt-2"
                rows={3}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-10 px-8 py-4 bg-[#D6B48E] text-black font-bold rounded-xl flex items-center gap-2 hover:opacity-80"
        >
          Genereer Rapport <ArrowRight />
        </button>
      </div>

      <Footer />
    </div>
  );
}
