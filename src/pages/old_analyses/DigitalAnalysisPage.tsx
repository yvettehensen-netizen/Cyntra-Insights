import React, { useState } from "react";
import { runDigitalAnalysis } from "@/lib/runDigitalAnalysis";

export default function DigitalAnalysisPage() {
  const [formData, setFormData] = useState({
    company: "",
    techUse: "",
    strategy: "",
    challenges: "",
    goals: "",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await runDigitalAnalysis(formData);
    setResult(res);

    const saved = JSON.parse(localStorage.getItem("cyntra_analyses") || "[]");
    saved.push({
      type: "Digitaal",
      score: res.score,
      summary: res.summary,
      date: new Date().toISOString(),
    });
    localStorage.setItem("cyntra_analyses", JSON.stringify(saved));

    setLoading(false);
  };

  return (
    <div className="page">
      <h1 className="title">Digitale Analyse</h1>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          <input name="company" placeholder="Bedrijfsnaam" onChange={handleChange} className="input" />
          <textarea name="techUse" placeholder="Welke digitale tools worden momenteel gebruikt?" onChange={handleChange} className="textarea" />
          <textarea name="strategy" placeholder="Is er een digitale strategie aanwezig?" onChange={handleChange} className="textarea" />
          <textarea name="challenges" placeholder="Wat zijn de uitdagingen in digitalisering?" onChange={handleChange} className="textarea" />
          <textarea name="goals" placeholder="Wat zijn de digitaliseringsdoelen?" onChange={handleChange} className="textarea" />
          <button type="submit" className="btn">{loading ? "Analyseren..." : "Genereer Rapport"}</button>
        </form>
      ) : (
        <Result result={result} />
      )}
    </div>
  );
}

const Result = ({ result }: any) => (
  <div className="result">
    <h2 className="text-[#D6B48E] text-xl font-bold mb-2">Resultaat</h2>
    <p>Score: {result.score}/100</p>
    <pre className="whitespace-pre-line">{result.summary}</pre>
  </div>
);

