// ================================
// src/aurelius/components/CyntraPrimaryAction.tsx
// ================================

export function CyntraPrimaryAction({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        mt-14
        px-14
        py-5
        uppercase
        tracking-[0.4em]
        text-base
        font-semibold
        border
        transition-all
        duration-300
        ${
          disabled
            ? "border-[var(--c-border)] text-[var(--c-text-muted)] cursor-not-allowed opacity-60"
            : "border-[var(--c-accent)] text-[var(--c-accent)] hover:bg-[var(--c-accent)] hover:text-[var(--c-bg)] hover:shadow-[var(--c-glow-gold)] active:scale-[0.98]"
        }
      `}
    >
      {label}
    </button>
  );
}
