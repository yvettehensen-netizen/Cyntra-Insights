import React, { useState, useRef } from "react";
import { AI_MODEL } from "../../config/aiModel";

export default function AIChatBox({ context }) {
  const [chat, setChat] = useState([]);
  const inputRef = useRef();

  const sendMessage = async () => {
    const question = inputRef.current.value.trim();
    if (!question) return;

    setChat((prev) => [...prev, { role: "user", text: question }]);
    inputRef.current.value = "";

    const response = await fetch(
      "https://thingproxy.freeboard.io/fetch/https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content: "Je bent een AI-bedrijfsadviseur die vragen beantwoordt over analyses.",
            },
            {
              role: "user",
              content: `Context van analyse:\n${context}\n\nVervolgvraag:\n${question}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "Geen antwoord ontvangen.";

    setChat((prev) => [...prev, { role: "assistant", text: answer }]);
  };

  return (
    <div className="border-t border-[#2A2A2A] pt-6 mt-8">
      <h2 className="text-lg font-semibold text-[#D6B48E] mb-4">💬 AI Vervolgadvies</h2>

      <div className="bg-[#141414] rounded-xl p-4 h-80 overflow-y-auto mb-4">
        {chat.length === 0 && (
          <p className="text-gray-500 text-sm">Stel hier je vragen over het rapport…</p>
        )}
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 ${
              msg.role === "user" ? "text-[#D6B48E]" : "text-gray-300"
            }`}
          >
            <b>{msg.role === "user" ? "Jij:" : "AI:"}</b> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          placeholder="Stel een vraag over jouw analyse..."
          className="flex-1 p-2 rounded bg-[#1A1A1A] border border-[#333] text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-[#D6B48E] text-black px-4 py-2 rounded-lg hover:bg-[#c2a47c]"
        >
          Verstuur
        </button>
      </div>
    </div>
  );
}
