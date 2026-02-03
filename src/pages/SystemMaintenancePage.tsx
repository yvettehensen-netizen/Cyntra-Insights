import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SystemTask {
  id: string;
  title: string;
  description: string;
  status: "idle" | "running" | "completed" | "error";
}

export default function SystemMaintenancePage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<SystemTask[]>([
    {
      id: "t1",
      title: "Database Optimalisatie",
      description: "Controleert indexen en verwijdert oude cachebestanden.",
      status: "idle",
    },
    {
      id: "t2",
      title: "AI-Model Updates",
      description: "Laadt nieuwe machine learning-modellen.",
      status: "idle",
    },
    {
      id: "t3",
      title: "Beveiligingscontrole",
      description: "Scant op kwetsbaarheden.",
      status: "idle",
    },
  ]);

  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLog(["🧩 Systeem klaar voor onderhoud."]);
  }, []);

  const runMaintenance = () => {
    if (running) return;
    setRunning(true);
    setLog(["🚀 Onderhoud gestart..."]);

    let step = 0;

    const interval = setInterval(() => {
      if (step >= tasks.length) {
        clearInterval(interval);
        setRunning(false);
        setLog((prev) => [...prev, "✅ Alle taken voltooid."]);
        return;
      }

      const t = tasks[step];
      setLog((prev) => [...prev, `🔧 ${t.title} bezig...`]);

      step++;
    }, 1500);
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🧩 Systeemonderhoud</h1>

      <button
        className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
        onClick={runMaintenance}
      >
        Start onderhoud
      </button>

      <button
        onClick={() => navigate("/portal/dashboard")}
        className="ml-4 px-4 py-2 border border-gray-500 rounded hover:bg-gray-800"
      >
        ↩ Terug
      </button>

      <div className="mt-6 bg-gray-900 p-4 rounded h-60 overflow-auto">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
