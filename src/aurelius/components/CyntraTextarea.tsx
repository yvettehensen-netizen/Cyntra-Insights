// ================================
// src/aurelius/components/CyntraTextarea.tsx
// ================================

export function CyntraTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative group">
      <div className="absolute top-4 right-6 text-xs tracking-[0.3em] uppercase text-[var(--c-text-muted)] opacity-70 group-focus-within:opacity-100 transition-opacity">
        Internal Input
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="
          w-full
          bg-[var(--c-panel)]
          border border-[var(--c-border)]
          text-[var(--c-text-primary)]
          font-mono
          text-base
          tracking-[0.05em]
          p-8
          outline-none
          focus:border-[var(--c-accent)]
          focus:ring-2 focus:ring-[var(--c-accent-soft)]
          resize-none
          shadow-inner
          transition-all
        "
      />
    </div>
  );
}
