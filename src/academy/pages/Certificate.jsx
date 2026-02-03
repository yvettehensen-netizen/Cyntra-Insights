import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { trainings } from "../data/trainings";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Certificate() {
  const training = trainings[0];
  const modules = training.modules;
  const [isComplete, setIsComplete] = useState(false);
  const [userName, setUserName] = useState("");
  const [date, setDate] = useState("");
  const certRef = useRef();
  const navigate = useNavigate();

  // ✅ Controleer voortgang
  useEffect(() => {
    const allCompleted = modules.every((m) => {
      const saved = localStorage.getItem(`module-${m.id}-answers`);
      if (!saved) return false;
      const answers = JSON.parse(saved);
      return m.reflections.every((_, i) => answers[i]?.trim() !== "");
    });
    setIsComplete(allCompleted);

    const today = new Date();
    setDate(today.toLocaleDateString("nl-NL"));
  }, []);

  // ✅ PDF Download met verbeterde kwaliteit
  const handleDownload = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: "#0E0E0E",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("Cyntra_Certificaat.pdf");
  };

  if (!isComplete) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-gray-300 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-[#D6B48E]">
          🔒 Certificaat nog niet beschikbaar
        </h2>
        <p className="text-gray-400 mb-6">
          Voltooi eerst alle modules om je certificaat te ontgrendelen.
        </p>
        <Link
          to="/academy/accountmanagement/dashboard"
          className="px-5 py-2 bg-[#D6B48E] text-black rounded-lg font-semibold hover:bg-[#caa87f] transition"
        >
          Ga terug naar je training →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-16 font-inter">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* 🎓 Header */}
        <motion.h1
          className="text-4xl font-bold text-[#D6B48E]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Cyntra Certificaat van Voltooiing
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Dit certificaat bevestigt dat de deelnemer de volledige training heeft afgerond:
        </p>

        {/* 🧾 Certificaatweergave */}
        <div
          ref={certRef}
          className="relative bg-gradient-to-br from-[#0E0E0E] via-[#1A1A1A] to-[#2A2A2A] border-4 border-[#D6B48E]/60 rounded-2xl shadow-2xl py-16 px-12 mt-8 overflow-hidden"
        >
          {/* 🔆 Gouden glow-effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D6B48E]/10 via-transparent to-[#caa87f]/10 blur-3xl"></div>

          {/* 💠 Watermerk */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
            <img
              src="https://i.ibb.co/JwjXncPj/Cyntra-Insights-1-Optimized-1-MB.png"
              alt="Cyntra watermark"
              className="w-2/3 object-contain"
            />
          </div>

          <div className="relative text-center space-y-8">
            <h2 className="text-3xl font-bold text-[#D6B48E] font-playfair">
              {training.title}
            </h2>

            <div className="mt-10 space-y-4">
              <input
                type="text"
                placeholder="Voer je naam in..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-transparent border-b border-[#D6B48E]/50 text-center text-2xl font-medium w-full max-w-md focus:outline-none text-[#D6B48E] placeholder-gray-500"
              />
              <p className="text-gray-400 text-lg">
                heeft op{" "}
                <span className="text-[#D6B48E]">{date}</span> de training succesvol afgerond.
              </p>
            </div>

            <div className="mt-10 text-[#D6B48E] font-semibold text-xl">
              🏅 Officieel gecertificeerd door <br />
              <span className="font-playfair text-2xl">Cyntra Academy</span>
            </div>
          </div>

          {/* 🔲 Hoekdecoratie */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#D6B48E]/50 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#D6B48E]/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#D6B48E]/50 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#D6B48E]/50 rounded-br-lg"></div>
        </div>

        {/* 🖨️ Downloadknop */}
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-[#D6B48E] text-black font-semibold rounded-lg hover:bg-[#caa87f] transition"
          >
            📄 Download certificaat als PDF
          </button>
          <button
            onClick={() => navigate("/academy/accountmanagement/dashboard")}
            className="px-6 py-2 border border-[#D6B48E]/60 text-[#D6B48E] font-semibold rounded-lg hover:bg-[#D6B48E]/10 transition"
          >
            Terug naar dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
