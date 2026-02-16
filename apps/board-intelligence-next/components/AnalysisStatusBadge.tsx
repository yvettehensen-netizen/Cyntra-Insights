"use client";

import type { AnalysisStatus } from "@/lib/types";

const statusClasses: Record<AnalysisStatus, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-400/50",
  running: "bg-sky-500/20 text-sky-300 border-sky-400/50",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
  failed: "bg-red-500/20 text-red-300 border-red-400/50",
};

export default function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
