"use client";

interface StartAnalysisButtonProps {
  disabled?: boolean;
  busy?: boolean;
  onClick: () => Promise<void> | void;
}

export default function StartAnalysisButton({
  disabled,
  busy,
  onClick,
}: StartAnalysisButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => onClick()}
      className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Analyse starten..." : "Start Analyse"}
    </button>
  );
}
