import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CyntraAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Welkom bij Cyntra Insights. Waar kan ik je vandaag mee helpen?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simpel gesimuleerd AI-antwoord (placeholder)
    const lower = input.toLowerCase();
    let reply = "Interessant! Kun je dat iets verder toelichten?";

    if (lower.includes("analyse")) {
      reply =
        "📊 Je kunt alle strategische analyses vinden in het menu — van marktpositie tot ESG.";
    } else if (lower.includes("training")) {
      reply =
        "🎓 Onze AI-training helpt je stap voor stap accountmanagement-skills versterken.";
    } else if (lower.includes("rapport")) {
      reply =
        "🧾 Rapporten worden vergeleken met benchmark-data uit jouw sector.";
    } else if (lower.includes("help") || lower.includes("hulp")) {
      reply = "✨ Ik kan je begeleiden bij het kiezen van de juiste module of analyse.";
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 💬 Toggle Button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#D6B48E] text-black rounded-full w-14 h-14 shadow-xl flex items-center justify-center text-2xl"
      >
        💬
      </motion.button>

      {/* 🪄 Chatvenster */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="assistant-window"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-[#2A2A2A] text-[#D6B48E] font-semibold text-sm text-center">
              Cyntra Strategisch Assistent
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 h-64">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.from === "bot"
                      ? "bg-[#1E1E1E] text-gray-300 self-start"
                      : "bg-[#D6B48E] text-black self-end ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#2A2A2A] flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Typ je vraag..."
                className="flex-1 bg-transparent text-gray-200 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                className="text-[#D6B48E] font-semibold ml-2 hover:opacity-80 transition"
              >
                ▶
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

