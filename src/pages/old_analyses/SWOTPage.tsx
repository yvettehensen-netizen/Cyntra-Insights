import React, { useState } from 'react';
import { generateSWOT, uploadDocuments } from '../../cie/client';
import type { SWOTResult } from '../../cie/types';

export default function SWOTPage() {
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SWOTResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let documentData = '';
      if (files.length > 0) {
        const uploadResult = await uploadDocuments(files);
        documentData = uploadResult.extracted_text || '';
      }

      const analysisResult = await generateSWOT({
        company_context: context,
        document_data: documentData,
      });

      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-3">
            SWOT Analysis
          </h1>
          <p className="text-gray-400">
            Strategische analyse: Strengths, Weaknesses, Opportunities, Threats
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#D4AF37] mb-2">
              Bedrijfscontext
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Beschrijf het bedrijf: sector, omvang, producten, strategie..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none min-h-32"
              required
            />
          </div>

          <div className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#D4AF37] mb-2">
              Upload Documenten (optioneel)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.docx,.txt"
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:text-black file:font-semibold hover:file:bg-[#c9a332] cursor-pointer"
            />
            {files.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {files.length} bestand(en) geselecteerd
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !context}
            className="w-full bg-[#D4AF37] text-black font-semibold py-4 rounded-xl hover:bg-[#c9a332] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analyseren...' : 'Genereer SWOT Analyse'}
          </button>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
        </form>

        {result && (
          <div className="bg-[#0E0E0E] border border-[#D4AF37]/30 rounded-2xl p-8 space-y-8 print-section">
            <div className="flex justify-between items-center mb-6 no-print">
              <h2 className="text-3xl font-bold text-[#D4AF37]">
                SWOT Analyse Resultaat
              </h2>
              <button
                onClick={() => window.print()}
                className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#c9a332] transition"
              >
                Print / PDF
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1A1A1A] border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span>✓</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((item, i) => (
                    <li key={i} className="text-gray-300 pl-4 border-l-2 border-green-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-red-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span>⚠</span> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((item, i) => (
                    <li key={i} className="text-gray-300 pl-4 border-l-2 border-red-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <span>↑</span> Opportunities
                </h3>
                <ul className="space-y-2">
                  {result.opportunities.map((item, i) => (
                    <li key={i} className="text-gray-300 pl-4 border-l-2 border-blue-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <span>⚡</span> Threats
                </h3>
                <ul className="space-y-2">
                  {result.threats.map((item, i) => (
                    <li key={i} className="text-gray-300 pl-4 border-l-2 border-orange-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-3">
                Executive Summary
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {result.summary}
              </p>
            </div>

            <div className="text-sm text-gray-500 text-center pt-4 border-t border-[#2A2A2A]">
              Gegenereerd op {new Date(result.date).toLocaleString('nl-NL')} • Cyntra Insights Engine
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
