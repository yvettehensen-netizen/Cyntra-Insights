"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StartAnalysisButton from "@/components/StartAnalysisButton";
import AnalysisStatusBadge from "@/components/AnalysisStatusBadge";
import AnalysisResultJson from "@/components/AnalysisResultJson";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import type { AnalysisRow, AnalysisUploadRow, ReportRow } from "@/lib/types";

export default function AnalysisDashboard() {
  const [organization, setOrganization] = useState("Demo BV");
  const [description, setDescription] = useState(
    "Bestuurlijke Intelligentielaag Analyse voor strategische besluitvorming en executierisico's."
  );
  const [runImmediately, setRunImmediately] = useState(true);

  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [report, setReport] = useState<ReportRow | null>(null);
  const [uploads, setUploads] = useState<AnalysisUploadRow[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const shouldPoll = useMemo(
    () => analysis?.status === "pending" || analysis?.status === "running",
    [analysis?.status]
  );

  const refreshAnalysis = useCallback(async (analysisId: string) => {
    const response = await fetch(`/api/analyses/${analysisId}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Failed to fetch analysis status");
    }

    setAnalysis(payload.analysis);
    setReport(payload.report ?? null);
    if (Array.isArray(payload.uploads)) {
      setUploads(payload.uploads);
    }
  }, []);

  useEffect(() => {
    if (!analysis?.id || !shouldPoll) return;

    const timer = setInterval(() => {
      refreshAnalysis(analysis.id).catch((pollError) => {
        const message = pollError instanceof Error ? pollError.message : String(pollError);
        setError(message);
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [analysis?.id, shouldPoll, refreshAnalysis]);

  const onStart = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization,
          description,
          uploadIds: uploads.map((upload) => upload.id),
          runImmediately,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to start analysis");
      }

      setAnalysis(payload.analysis);
      setReport(null);
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : String(startError);
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [organization, description, uploads, runImmediately]);

  const onUpload = useCallback(async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    setError(null);

    try {
      const uploaded: AnalysisUploadRow[] = [];

      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.set("organization", organization);
        formData.set("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || `Upload failed for ${file.name}`);
        }

        uploaded.push(payload.upload as AnalysisUploadRow);
      }

      setUploads((prev) => [...prev, ...uploaded]);
      setPendingFiles([]);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : String(uploadError);
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [organization, pendingFiles]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Nieuwe analyse</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Organisatie
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              placeholder="Organisatie"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Inline verwerking (dev)
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={runImmediately}
                onChange={(e) => setRunImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-950"
              />
              <span className="text-xs text-slate-400">
                Zet uit als je dedicated worker gebruikt (`npm run worker`).
              </span>
            </div>
          </label>
        </div>

        <label className="mt-4 block text-sm text-slate-300">
          Analysebeschrijving
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            placeholder="Beschrijf de bestuurlijke context"
          />
        </label>

        <label className="mt-4 block text-sm text-slate-300">
          Upload bronbestanden
          <input
            type="file"
            multiple
            onChange={(e) =>
              setPendingFiles(Array.from(e.target.files ?? []))
            }
            className="mt-1.5 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-950"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onUpload}
            disabled={!pendingFiles.length || uploading}
            className="rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploaden..." : "Upload bestanden"}
          </button>
          <p className="text-xs text-slate-400">
            Geüpload: {uploads.length} bestand(en)
          </p>
        </div>

        {uploads.length ? (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
            <p className="mb-2 font-semibold text-slate-200">Bronbestanden</p>
            <ul className="space-y-1">
              {uploads.map((upload) => (
                <li key={upload.id}>
                  {upload.file_name} • {upload.mime_type} • {upload.size_bytes} bytes
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4">
          <StartAnalysisButton onClick={onStart} busy={busy} disabled={!organization || !description} />
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-500/60 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </section>
      ) : null}

      {analysis ? (
        <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Analyse status</h3>
              <p className="text-xs text-slate-400">Analyse ID: {analysis.id}</p>
            </div>
            <AnalysisStatusBadge status={analysis.status} />
          </header>

          {analysis.error_message ? (
            <div className="rounded-lg border border-red-400/60 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {analysis.error_message}
            </div>
          ) : null}

          {analysis.status === "done" ? (
            <div className="flex flex-wrap items-center gap-3">
              <DownloadPdfButton analysisId={analysis.id} />
              <a
                href={`/api/reports/${analysis.id}`}
                className="inline-flex rounded-xl border border-sky-400/70 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/15"
              >
                Rapport metadata
              </a>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm text-slate-300">Result payload (JSON)</p>
            <AnalysisResultJson
              value={analysis.result_payload ?? { status: analysis.status, message: "Nog geen resultaten" }}
            />
          </div>

          {report ? (
            <div className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Rapport: {report.title}</p>
              <p className="mt-1 text-xs text-slate-400">{report.summary}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
