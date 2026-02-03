import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function LockedSection({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative p-10 border border-white/10 rounded-2xl bg-white/5">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 rounded-2xl" />

      <div className="relative z-10 text-center">
        <Lock className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" />
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          {description}
        </p>

        <Link
          to="/billing/upgrade"
          className="inline-block px-8 py-3 rounded-xl
            bg-[#D4AF37] text-black font-semibold hover:opacity-90"
        >
          Ontgrendel volledige analyse
        </Link>

        <p className="text-xs text-gray-500 mt-4">
          Je data blijft privé. Geen training op klantinput.
        </p>
      </div>
    </div>
  );
}
