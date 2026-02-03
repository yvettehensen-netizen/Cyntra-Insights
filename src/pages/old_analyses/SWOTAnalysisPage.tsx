import React, { useState } from 'react';
import { uploadDocuments, generateSWOT } from '../../cie/client';
import type { SWOTResult } from '../../cie/types';

export default function SWOTAnalysisPage() {
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [documentData, setDocumentData] = useState<string>('');
  const [result, setResult] = useState<SWOTResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze'>('upload');
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!files || files.length === 0) {
      setError('Upload minimaal één document.');
      return;
    }

    setLoading(true);

    try {
      const data = await uploadDocuments(files);
      setDocumentData(data.document_data);
      setStep('analyze');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!context.trim()) {
      setError('Geef eerst bedrijfscontext.');
      return;
    }

    setLoading(true);

    try {
      const data = await generateSWOT({
        company_context: context,
        document_data: documentData,
      });

      setResult(data);

      const stored = JSON.parse(localStorage.getItem('cyntra_analyses') || '[]');
      stored.push({ type: 'SWOT', date: new Date().toISOString(), ...data });
      localStorage.setItem('cyntra_analyses', JSON.stringify(stored));
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-3">
            SWOT Analysis
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Upload interne documenten, geef bedrijfscontext en ontvang een board-ready SWOT analyse.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {step === 'upload' && (
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">
              Stap 1: Upload Documenten
            </h2>
            <form onSubmit={handleUpload}>
              <label className="block mb-3 text-sm text-gray-300">
                Documenten (PDF / DOCX / TXT):
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-gray-300 mb-6
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-[#D4AF37] file:text-black
                  hover:file:bg-[#C5A028] file:cursor-pointer"
              />
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-medium
                  hover:bg-[#C5A028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verwerken...' : 'Upload & Samenvatten'}
              </button>
            </form>
          </div>
        )}

        {step === 'analyze' && (
          <div className="space-y-6">
            {documentData && (
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-[#D4AF37] mb-3">
                  Document Samenvatting
                </h3>
                <pre className="text-xs text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {documentData}
                </pre>
              </div>
            )}

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">
                Stap 2: Bedrijfscontext
              </h2>
              <form onSubmit={handleAnalyze}>
                <label className="block mb-3 text-sm text-gray-300">
                  Beschrijf het bedrijf (sector, omvang, kernproducten, strategie):
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Bijvoorbeeld: Software scale-up, 50 FTE, B2B SaaS platform voor HR, focus op MKB, 3M omzet, break-even..."
                  className="w-full h-40 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl
                    text-gray-100 placeholder-gray-600 mb-6 focus:border-[#D4AF37] focus:outline-none"
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="px-6 py-3 rounded-xl border border-[#2A2A2A] text-gray-400
                      hover:border-gray-600 transition-colors"
                  >
                    Terug
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !context.trim()}
                    className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-medium
                      hover:bg-[#C5A028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analyseren...' : 'Genereer SWOT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-6">
              SWOT Resultaat
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0A0A0A] border border-green-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-red-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Weaknesses</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-red-400 mr-2">−</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-blue-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">Opportunities</h3>
                <ul className="space-y-2">
                  {result.opportunities.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-2">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-orange-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-4">Threats</h3>
                <ul className="space-y-2">
                  {result.threats.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-orange-400 mr-2">!</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#D4AF37] mb-3">Executive Summary</h3>
              <p className="text-gray-300 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
