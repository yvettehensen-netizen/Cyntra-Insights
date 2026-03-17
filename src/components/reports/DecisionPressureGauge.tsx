type DecisionPressureGaugeProps = {
  label: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  hint: string;
};

const LEVEL_STYLES: Record<DecisionPressureGaugeProps["level"], string> = {
  LOW: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  MEDIUM: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  HIGH: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export default function DecisionPressureGauge({ label, level, hint }: DecisionPressureGaugeProps) {
  return (
    <article className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${LEVEL_STYLES[level]}`}>
          {level}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6] text-slate-300">{hint}</p>
    </article>
  );
}
