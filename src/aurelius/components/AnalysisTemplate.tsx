import { useState } from "react";
import { useAureliusAnalysis } from "../hooks/useAureliusAnalysis";
import AureliusResultBlock from "./AureliusResultBlock";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
}

export default function AnalysisTemplate({
  title,
  description,
  scope = [],
  formFields = [],
}: {
  title: string;
  description: string;
  scope?: string[];
  formFields: Field[];
}) {
  const { loading, result, error, runAnalysis } = useAureliusAnalysis();
  const [formData, setFormData] = useState<Record<string, string>>({});

  function updateField(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function startAnalysis() {
    let context = `Analyse: ${title}\n\nBeschrijving: ${description}\n\n`;

    context += `--- INPUT DATA ---\n`;
    formFields.forEach((f) => {
      context += `${f.label}:\n${formData[f.name] || ""}\n\n`;
    });

    await runAnalysis({
      analysisType: title.toLowerCase(),
      textInput: context,
    });
  }

  return (
    <div className="text-white max-w-3xl">

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-400 mb-6">{description}</p>

      {scope.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Scope</h2>
          <ul className="list-disc ml-6 text-gray-300">
            {scope.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {formFields.map((field) => (
          <div key={field.name}>
            <label className="block mb-1 text-sm text-gray-300">
              {field.label}
            </label>

            {field.type === "textarea" ? (
              <textarea
                className="w-full bg-black/30 border border-white/10 p-4 rounded-lg"
                rows={4}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.label}
              />
            ) : (
              <input
                type="text"
                className="w-full bg-black/30 border border-white/10 p-3 rounded-lg"
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.label}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={startAnalysis}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg"
      >
        {loading ? "Analyseren…" : "Analyse starten"}
      </button>

      {error && (
        <div className="mt-4 text-red-400 bg-red-900/30 p-3 rounded-lg">
          {error}
        </div>
      )}

      {result && <AureliusResultBlock result={result} />}
    </div>
  );
}
