import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Trash2, Clock } from 'lucide-react';

interface Document {
  id: string;
  created_at: string;
  scrubbed_text: string;
  removed_entities: string[];
  original_url: string;
}

interface Analysis {
  id: string;
  type: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/login');
        return;
      }

      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      setDocuments(docs || []);

      const { data: allAnalyses, error: analysesError } = await supabase
        .from('analyses')
        .select('id, type, created_at, document_id')
        .eq('owner_user_id', user.user.id);

      if (analysesError) throw analysesError;

      const analysesMap: Record<string, Analysis[]> = {};
      (allAnalyses || []).forEach((analysis: any) => {
        if (analysis.document_id) {
          if (!analysesMap[analysis.document_id]) {
            analysesMap[analysis.document_id] = [];
          }
          analysesMap[analysis.document_id].push(analysis);
        }
      });

      setAnalyses(analysesMap);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(documents.filter(d => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Fout bij verwijderen document');
    }
  }

  function downloadScrubbed(doc: Document) {
    const blob = new Blob([doc.scrubbed_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrubbed-${doc.id.substring(0, 8)}.txt`;
    a.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-gray-400">Documenten laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">
            Mijn Documenten
          </h1>
          <p className="text-gray-400">
            Alle geüploade en geanonimiseerde documenten
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nog geen documenten
            </h3>
            <p className="text-gray-500 mb-6">
              Upload je eerste document via Volledige Analyse
            </p>
            <button
              onClick={() => navigate('/analyses/complete')}
              className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#c9a332] transition font-semibold"
            >
              Start Analyse
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-[#1A1A1A] border-2 rounded-xl p-4 cursor-pointer transition ${
                    selectedDoc?.id === doc.id
                      ? 'border-[#D4AF37]'
                      : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#D4AF37]" />
                      <div>
                        <div className="text-sm font-semibold text-gray-200">
                          Document {doc.id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.created_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="flex-1 px-3 py-2 bg-[#2A2A2A] text-gray-300 text-xs rounded-lg hover:bg-[#3A3A3A] transition flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Bekijk
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadScrubbed(doc);
                      }}
                      className="flex-1 px-3 py-2 bg-[#2A2A2A] text-gray-300 text-xs rounded-lg hover:bg-[#3A3A3A] transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Downloaden
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="px-3 py-2 bg-red-900/20 text-red-400 text-xs rounded-lg hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {doc.removed_entities?.length || 0} entiteiten gescrubbed
                    </span>
                    {analyses[doc.id] && (
                      <span className="text-[#D4AF37]">
                        {analyses[doc.id].length} analyse(s)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
              {selectedDoc ? (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 h-full overflow-y-auto">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
                    Document Preview
                  </h3>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">
                      Geanonimiseerde Tekst
                    </h4>
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                      {selectedDoc.scrubbed_text}
                    </pre>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">
                      Verwijderde Entiteiten
                    </h4>
                    {selectedDoc.removed_entities?.length > 0 ? (
                      <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-4">
                        {selectedDoc.removed_entities.map((entity, idx) => (
                          <li key={idx}>{entity}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Geen entiteiten verwijderd</p>
                    )}
                  </div>

                  {analyses[selectedDoc.id] && analyses[selectedDoc.id].length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">
                        Gekoppelde Analyses
                      </h4>
                      <div className="space-y-2">
                        {analyses[selectedDoc.id].map((analysis) => (
                          <div
                            key={analysis.id}
                            className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-300">
                                {analysis.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(analysis.created_at).toLocaleDateString('nl-NL')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Selecteer een document om de details te bekijken
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
