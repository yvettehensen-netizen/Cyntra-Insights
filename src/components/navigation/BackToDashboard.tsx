import { useNavigate } from "react-router-dom";

type BackToDashboardProps = {
  to?: string;
  label?: string;
  className?: string;
};

export default function BackToDashboard({
  to = "/portal/dashboard",
  label = "Terug naar Dashboard",
  className = "",
}: BackToDashboardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`fixed right-4 top-24 z-[9500] inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/55 bg-[#17130c]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#f3d983] shadow-lg transition hover:bg-[#D4AF37] hover:text-black ${className}`}
      aria-label={label}
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}

