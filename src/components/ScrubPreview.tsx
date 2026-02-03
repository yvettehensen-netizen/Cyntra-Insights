import React from "react";

export default function ScrubPreview({
  originalText,
  scrubbedText,
  removedEntities = [],
}: {
  originalText: string;
  scrubbedText: string;
  removedEntities?: string[];
}) {
  return (
    <div className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-2xl p-6 mt-8">
      <h2 className="text-xl font-semibold text-[#D4AF37] mb-4">
        🔐 Document Anonimisatie – Preview
      </h2>

      <p className="text-gray-400 text-sm mb-6">
        Cyntra anonimiseert alle gevoelige data vóór AI-analyse.
        Links zie je de oorspronkelijke tekst (alleen jij ziet deze),
        rechts de geanonimiseerde versie die naar de AI gaat.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Origineel document
          </h3>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {originalText || "Geen originele tekst ontvangen."}
          </pre>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Geanonimiseerde AI-invoer
          </h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {scrubbedText || "Geen geanonimiseerde tekst ontvangen."}
          </pre>
        </div>
      </div>

      <div className="mt-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          🔍 Verwijderde/gescrubde entiteiten
        </h3>

        {removedEntities.length === 0 && (
          <p className="text-xs text-gray-500">Geen entiteiten gedetecteerd.</p>
        )}

        <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
          {removedEntities.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigator.clipboard.writeText(scrubbedText)}
          className="px-4 py-2 bg-[#D4AF37] text-black text-xs rounded-lg hover:bg-[#c9a332] font-semibold transition"
        >
          Kopieer geanonimiseerde tekst
        </button>

        <button
          onClick={() => {
            const blob = new Blob([scrubbedText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "scrubbed.txt";
            a.click();
          }}
          className="px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-gray-300 text-xs rounded-lg hover:bg-[#3A3A3A] transition"
        >
          Download scrubbed versie
        </button>
      </div>
    </div>
  );
}
