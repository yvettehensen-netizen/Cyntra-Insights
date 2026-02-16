"use client";

interface DownloadPdfButtonProps {
  analysisId: string;
}

export default function DownloadPdfButton({ analysisId }: DownloadPdfButtonProps) {
  return (
    <a
      className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
      href={`/api/reports/pdf?analysisId=${encodeURIComponent(analysisId)}`}
    >
      Download PDF
    </a>
  );
}
