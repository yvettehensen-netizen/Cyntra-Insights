import { Shield, FileText, Timer } from "lucide-react";

export default function TrustBar() {
  const items = [
    { icon: <FileText size={14} />, text: "Gem. rapport 28–42 pagina's" },
    { icon: <Timer size={14} />, text: "Doorlooptijd 24–48 uur" },
    { icon: <Shield size={14} />, text: "100% datasafe & geanonimiseerd" },
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-6 text-[11px] text-gray-300">
      {items.map((i, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-[#111]/60 px-3 py-1.5 rounded-full border border-white/10">
          {i.icon}
          {i.text}
        </div>
      ))}
    </div>
  );
}
