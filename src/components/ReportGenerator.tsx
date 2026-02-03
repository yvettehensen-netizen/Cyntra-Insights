// src/components/ReportGenerator.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ReportGenerator() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("");

    const { data } = await supabase.auth.getUser();
    const user_id = data?.user?.id || "00000000-0000-0000-0000-000000000000";

    console.log("🧠 Mock-rapport generator actief!");
    const mockReport = {
      title: title || "Mock-rapport – voorbeeldweergave",
      content: {
        samenvatting:
          "Dit is een voorbeeldrapport zonder actieve OpenAI-sleutel.",
        bevindingen: [
          "Mock-analyse 1: Alles draait goed.",
          "Mock-analyse 2: Wacht op 17 november voor echte GPT-output.",
        ],
        aanbevelingen: [
          "Activeer je OpenAI-token om live analyses te genereren.",
          "Gebruik deze mock-rapporten om het design te testen.",
        ],
      },
    };

    const { error } = await supabase.from("reports").insert([
      {
        user_id,
        title: mockReport.title,
        content: mockReport.content,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      setMessage("❌ Er ging iets mis bij het opslaan van het mock-rapport.");
      return;
    }

    console.log("✅ Mock-rapport succesvol opgeslagen in Supabase!");
    setMessage("✅ Mock-rapport opgeslagen in Supabase!");
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h2>📊 Rapport Generator</h2>

      <label
        htmlFor="report-title"
        style={{ display: "block", marginTop: 20, color: "#D6B48E" }}
      >
        Rapporttitel:
      </label>
      <input
        id="report-title"
        name="reportTitle"
        type="text"
        placeholder="Bijv. Quickscan Duitsland"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          marginTop: 8,
          padding: 10,
          borderRadius: 6,
          background: "#1A1A1A",
          color: "#F8F5F2",
          border: "1px solid #444",
          width: "100%",
          maxWidth: 400,
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#D6B48E",
          color: "#000",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {loading ? "Bezig met genereren..." : "Nieuw rapport"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 20,
            background: "#222",
            padding: 10,
            borderRadius: 8,
            color: message.startsWith("✅") ? "#A5FF9E" : "#FF9E9E",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
