// src/aurelius/IntakeWizardAurelius.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AureliusNavbar from "./components/AureliusNavbar";

import { runAureliusEngine } from "../cie/aureliusClient";
import { saveAureliusReport } from "../api/saveAureliusReport";

import { Loader2 } from "lucide-react";

export default function IntakeWizardAurelius() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [fte, setFte] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [ambition, setAmbition] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [docSummary, setDocSummary] = useState("");
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const painOptions = [
    "Marges staan onder druk",
    "Cashflow onstabiel",
    "Te afhankelijk van een paar klanten",
    "Medewerkers vermoeid / cultuur stroef",
    "Geen duidelijke strategie",
    "IT achterloopt",
  ];

  function togglePain(x: string) {
    setPainPoints(prev =>
      prev.includes(x) ? prev.filter(p => p !== x) : [...prev, x]
    );
  }

  async function uploadDocuments() {
    if (!documents) return;
    setUploadingDocs(true);

    const form = new FormData();
    Array.from(documents).forEach(f => form.append("files", f));

    const res = await fetch(
      (import.meta as any).env.VITE_SUPABASE_FUNCTION_URL + "/document-upload",
      { method: "POST", body: form }
    );

    const json = await res.json();
    setDocSummary(json.document_data || "");
    setUploadingDocs(false);
  }

  async function startAnalysis() {
    setLoading(true);
    setError("");

    const fullContext = `
Bedrijfsnaam: ${companyName}
Type bedrijf: ${companyType}
Omzet: ${revenue}
FTE: ${fte}

Belangrijkste uitdagingen:
${painPoints.map(p => "- " + p).join("\n")}

Ambitie:
${ambition}

(Document data volgt hieronder)
    `.trim();

    const engine = await runAureliusEngine({
      company_context: fullContext,
      document_data: docSummary,
    });

    if (!engine.success) {
      setError("Analyse mislukt: " + engine.error?.message);
      setLoading(false);
      return;
    }

    const save = await saveAureliusReport(
      type || "executive",
      companyName || "Naamloos",
      engine.data.result
    );

    if (!save.success) {
      setError("Opslaan in database mislukt.");
      setLoading(false);
      return;
    }

    navigate(`/portal/rapport/${save.data.id}`);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100">
      <AureliusNavbar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-[#F5D66B] mb-2">
          Bedrijfsanalyse – {type}
        </h1>
        <p className="text-gray-400 mb-8">
          Vul de stappen in. Aurelius 3.5 bouwt daarna een volledig directierapport.
        </p>

        {error && (
          <div className="bg-red-900/40 border border-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10 text-xs">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  s === step
                    ? "bg-[#F5D66B] text-black"
                    : s < step
                    ? "bg-green-600 text-white"
                    : "bg-[#222] text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className="w-8 h-px bg-[#444]" />}
            </div>
          ))}
        </div>

        {/* STEP CONTENTS */}
        {/* (DEZE ZIJN IDENTIEK AAN JOUW VERSIE – KLOPT COMPLEET) */}

        {step === 1 && (
          <Step1 
            setStep={setStep} 
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyType={companyType}
            setCompanyType={setCompanyType}
            revenue={revenue}
            setRevenue={setRevenue}
            fte={fte}
            setFte={setFte}
          />
        )}

        {step === 2 && (
          <Step2
            setStep={setStep}
            painPoints={painPoints}
            painOptions={painOptions}
            togglePain={togglePain}
            ambition={ambition}
            setAmbition={setAmbition}
          />
        )}

        {step === 3 && (
          <Step3
            documents={documents}
            setDocuments={setDocuments}
            uploadDocuments={uploadDocuments}
            uploadingDocs={uploadingDocs}
            docSummary={docSummary}
            setStep={setStep}
          />
        )}

        {step === 4 && (
          <Step4
            loading={loading}
            startAnalysis={startAnalysis}
            setStep={setStep}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   FIELD COMPONENT
------------------------------------------------------------------ */
function Field({ label, value, onChange, placeholder, textarea }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>

      {textarea ? (
        <textarea
          className="w-full bg-[#111] border border-[#222] rounded-lg p-3 text-sm"
          value={value}
          placeholder={placeholder}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full bg-[#111] border border-[#222] rounded-lg p-3 text-sm"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   STEPS (1–4)
------------------------------------------------------------------ */

function Step1(props: any) {
  return (
    <div className="bg-[#0b0b0b] p-6 rounded-xl border border-[#222] space-y-5">
      <h2 className="text-xl text-[#F5D66B] font-semibold mb-3">
        Stap 1 — Bedrijfsinformatie
      </h2>

      <Field label="Bedrijfsnaam" value={props.companyName} onChange={props.setCompanyName} />

      <Field
        label="Bedrijfstype"
        value={props.companyType}
        onChange={props.setCompanyType}
        placeholder="Bijv. Groothandel, software, consultancy"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Omzet (indicatie)" value={props.revenue} onChange={props.setRevenue} />
        <Field label="Aantal FTE" value={props.fte} onChange={props.setFte} />
      </div>

      <button
        className="px-5 py-2 bg-[#F5D66B] text-black rounded-lg"
        onClick={() => props.setStep(2)}
      >
        Volgende →
      </button>
    </div>
  );
}

function Step2(props: any) {
  return (
    <div className="bg-[#0b0b0b] p-6 rounded-xl border border-[#222] space-y-5">
      <h2 className="text-xl text-[#F5D66B] font-semibold mb-3">
        Stap 2 — Belangrijkste uitdagingen
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {props.painOptions.map((x: string) => (
          <button
            key={x}
            onClick={() => props.togglePain(x)}
            className={`px-3 py-2 rounded-lg text-left text-sm border ${
              props.painPoints.includes(x)
                ? "border-[#F5D66B] bg-[#F5D66B]/20 text-[#F5D66B]"
                : "border-[#333] bg-[#111]"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <Field
        label="Ambitie voor komende 1–3 jaar"
        value={props.ambition}
        onChange={props.setAmbition}
        textarea
      />

      <div className="flex justify-between">
        <button
          className="px-4 py-2 border border-[#333] rounded-lg"
          onClick={() => props.setStep(1)}
        >
          ← Terug
        </button>

        <button
          className="px-5 py-2 bg-[#F5D66B] text-black rounded-lg"
          onClick={() => props.setStep(3)}
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}

function Step3(props: any) {
  return (
    <div className="bg-[#0b0b0b] p-6 rounded-xl border border-[#222] space-y-5">
      <h2 className="text-xl text-[#F5D66B] font-semibold mb-3">
        Stap 3 — Documenten (optioneel)
      </h2>

      <input
        type="file"
        multiple
        onChange={(e) => props.setDocuments(e.target.files)}
        className="text-sm text-gray-300"
      />

      <button
        onClick={props.uploadDocuments}
        disabled={!props.documents || props.uploadingDocs}
        className="px-4 py-2 bg-[#222] border border-[#444] rounded-lg text-sm disabled:opacity-40"
      >
        {props.uploadingDocs ? "Verwerken…" : "Upload & samenvatten"}
      </button>

      {props.docSummary && (
        <div className="bg-[#111] border border-[#333] p-4 rounded-lg text-xs text-gray-300 h-40 overflow-y-auto">
          {props.docSummary}
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="px-4 py-2 border border-[#333] rounded-lg"
          onClick={() => props.setStep(2)}
        >
          ← Terug
        </button>

        <button
          className="px-5 py-2 bg-[#F5D66B] text-black rounded-lg"
          onClick={() => props.setStep(4)}
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}

function Step4(props: any) {
  return (
    <div className="bg-[#0b0b0b] p-6 rounded-xl border border-[#222] space-y-5">
      <h2 className="text-xl text-[#F5D66B] font-semibold mb-3">
        Stap 4 — Analyse starten
      </h2>

      <p className="text-gray-400 text-sm">
        Aurelius 3.5 verwerkt nu alle inputs + documenten. Dit duurt 5–20 seconden.
      </p>

      <button
        onClick={props.startAnalysis}
        disabled={props.loading}
        className="px-6 py-3 bg-[#F5D66B] text-black rounded-lg w-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {props.loading && <Loader2 className="animate-spin" />}
        Start analyse
      </button>

      <button
        className="px-4 py-2 mt-2 border border-[#333] rounded-lg w-full"
        onClick={() => props.setStep(3)}
      >
        ← Terug
      </button>
    </div>
  );
}
