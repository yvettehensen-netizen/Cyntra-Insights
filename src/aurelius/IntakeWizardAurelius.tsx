// ============================================================
// AURELIUS — INTAKE WIZARD (FINAL • STRICT TS • HEILIG)
// ROUTE: src/aurelius/IntakeWizardAurelius.tsx
// ============================================================

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AureliusNavbar from "./components/AureliusNavbar";
import { runAureliusEngine } from "../cie/aureliusClient";
import type { IntakeValues } from "../cie/contextBuilder";

import { Loader2 } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type StepNav = {
  next: () => void;
  prev?: () => void;
};

type Step1Props = StepNav & {
  intake: IntakeValues;
  setIntake: React.Dispatch<React.SetStateAction<IntakeValues>>;
};

type Step2Props = StepNav & {
  intake: IntakeValues;
  setIntake: React.Dispatch<React.SetStateAction<IntakeValues>>;
};

type Step3Props = StepNav & {
  documents: FileList | null;
  setDocuments: (f: FileList | null) => void;
  uploadDocuments: () => Promise<void>;
  uploadingDocs: boolean;
  docSummary: string;
};

type Step4Props = {
  loading: boolean;
  startAnalysis: () => Promise<void>;
  prev: () => void;
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
};

/* ============================================================
   MAIN
============================================================ */

export default function IntakeWizardAurelius() {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [intake, setIntake] = useState<IntakeValues>({
    companyName: "",
    situation: "",
    goals: "",
    challenges: "",
    teamDescription: "",
  });

  const [documents, setDocuments] = useState<FileList | null>(null);
  const [docSummary, setDocSummary] = useState<string>("");
  const [uploadingDocs, setUploadingDocs] = useState<boolean>(false);
  const documentUploadBaseUrl =
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
    (import.meta.env.VITE_SUPABASE_URL
      ? `${String(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, "")}/functions/v1`
      : "");

  /* ============================================================
     DOCUMENT UPLOAD
  ============================================================ */

  async function uploadDocuments(): Promise<void> {
    if (!documents) return;

    setUploadingDocs(true);

    try {
      if (!documentUploadBaseUrl) {
        throw new Error("SUPABASE_FUNCTIONS_URL ontbreekt");
      }

      const form = new FormData();
      Array.from(documents).forEach((f) => form.append("files", f));

      const res = await fetch(
        `${documentUploadBaseUrl.replace(/\/+$/, "")}/document-upload`,
        { method: "POST", body: form }
      );

      const json: { document_data?: string } = await res.json();
      setDocSummary(json.document_data ?? "");
    } catch {
      setError("Upload mislukt.");
    } finally {
      setUploadingDocs(false);
    }
  }

  /* ============================================================
     START ANALYSIS
  ============================================================ */

  async function startAnalysis(): Promise<void> {
    setLoading(true);
    setError("");

    const companyName = intake.companyName ?? "";
    const challenges = intake.challenges ?? "";

    if (!companyName.trim() || !challenges.trim()) {
      setError("Intake te vaag. Benoem organisatie en kernproblemen.");
      setLoading(false);
      return;
    }

    try {
      const engine = await runAureliusEngine({
        analysisType: type || "executive",
        intake,
        documentData: docSummary,
      });

      if (!engine.success) {
        throw new Error("Analyse mislukt.");
      }

      const analysisId = engine.meta?.request_id;
      if (!analysisId) {
        throw new Error("Analyse voltooid, maar analysis-id ontbreekt.");
      }

      navigate(`/portal/rapport/${analysisId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Onbekende fout tijdens analyse."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-black text-white">
      <AureliusNavbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#F5D66B] mb-6">
          Aurelius Intake — {type ?? "executive"}
        </h1>

        {error && (
          <div className="bg-red-900/40 border border-red-600 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <Step1
            intake={intake}
            setIntake={setIntake}
            next={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2
            intake={intake}
            setIntake={setIntake}
            prev={() => setStep(1)}
            next={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <Step3
            documents={documents}
            setDocuments={setDocuments}
            uploadDocuments={uploadDocuments}
            uploadingDocs={uploadingDocs}
            docSummary={docSummary}
            prev={() => setStep(2)}
            next={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <Step4
            loading={loading}
            startAnalysis={startAnalysis}
            prev={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEPS
============================================================ */

function Step1({ intake, setIntake, next }: Step1Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Bedrijfsnaam"
        value={intake.companyName ?? ""}
        onChange={(value) =>
          setIntake((prev) => ({ ...prev, companyName: value }))
        }
      />
      <Input
        label="Huidige situatie"
        value={intake.situation ?? ""}
        textarea
        onChange={(value) =>
          setIntake((prev) => ({ ...prev, situation: value }))
        }
      />
      <button onClick={next} className="btn-gold">
        Volgende →
      </button>
    </div>
  );
}

function Step2({ intake, setIntake, prev, next }: Step2Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Strategische doelen"
        value={intake.goals ?? ""}
        textarea
        onChange={(value) =>
          setIntake((prev) => ({ ...prev, goals: value }))
        }
      />
      <Input
        label="Kernproblemen"
        value={intake.challenges ?? ""}
        textarea
        onChange={(value) =>
          setIntake((prev) => ({ ...prev, challenges: value }))
        }
      />
      <div className="flex justify-between">
        <button onClick={prev}>← Terug</button>
        <button onClick={next} className="btn-gold">
          Volgende →
        </button>
      </div>
    </div>
  );
}

function Step3({
  documents,
  setDocuments,
  uploadDocuments,
  uploadingDocs,
  docSummary,
  prev,
  next,
}: Step3Props) {
  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        onChange={(e) => setDocuments(e.target.files)}
      />
      <button onClick={uploadDocuments} disabled={uploadingDocs}>
        {uploadingDocs ? "Uploaden..." : "Upload"}
      </button>
      {docSummary && (
        <pre className="text-xs bg-[#111] p-3 border border-[#222] rounded">
          {docSummary}
        </pre>
      )}
      <div className="flex justify-between">
        <button onClick={prev}>← Terug</button>
        <button onClick={next} className="btn-gold">
          Volgende →
        </button>
      </div>
    </div>
  );
}

function Step4({ loading, startAnalysis, prev }: Step4Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={startAnalysis}
        disabled={loading}
        className="btn-gold"
      >
        {loading && <Loader2 className="animate-spin inline mr-2" />}
        Start analyse
      </button>
      <button onClick={prev}>← Terug</button>
    </div>
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  value,
  onChange,
  textarea = false,
}: InputProps) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      {textarea ? (
        <textarea
          className="w-full p-3 bg-[#111] border border-[#222] min-h-[120px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full p-3 bg-[#111] border border-[#222]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
