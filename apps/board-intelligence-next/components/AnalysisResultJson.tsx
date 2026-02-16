"use client";

export default function AnalysisResultJson({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
