import React, { useState } from "react";

export default function AIConsultantChat({ navigate }: { navigate: (page: string) => void }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Welkom bij je AI Consultant. Waarmee kan ik je vandaag helpen?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    // 🧠 Simuleer AI-reactie
    setTimeout(() => {
      const response = {
        sender: "ai",
        text: "Interessante vraag. Op basis van je input zou ik adviseren om dit te analyseren binnen je bedrijfsstrategie. Wil je dat ik een rapport genereer?",
      };
      setMessages((prev) => [...prev, response]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-accent flex items-center gap-2">
          🤖 AI Consultant Chat
        </h1>
        <button
          onClick={() => navigate("dashboard")}
          className="text-sm bg-brand-accent text-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-light transition"
        >
          ← Terug naar Dashboard
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-brand-light/10 p-4 rounded-xl border border-brand-accent/10 shadow-inner space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-brand-accent text-brand-primary rounded-br-none"
                  : "bg-brand-surface text-brand-text border border-brand-accent/10 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-brand-accent/70 italic mt-2">
            ✨ AI Consultant denkt na...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Typ je bericht..."
          className="flex-1 bg-brand-surface border border-brand-accent/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition"
        />
        <button
          type="submit"
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-medium hover:bg-brand-light transition"
        >
          Verstuur
        </button>
      </form>
    </div>
  );
}
