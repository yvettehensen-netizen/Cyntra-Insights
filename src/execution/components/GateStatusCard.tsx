type GateStatusCardProps = {
  gateStatus: "on-track" | "gate-risk";
};

export default function GateStatusCard({ gateStatus }: GateStatusCardProps) {
  const tone =
    gateStatus === "on-track"
      ? "status-gate-ok border border-[#3C5E47]"
      : "status-gate-risk border border-[#C4A762]";

  return (
    <div className={`rounded-lg border px-4 py-3 ${tone}`}>
      <p className="text-xs uppercase tracking-wide">Gate Status</p>
      <p className="mt-1 text-sm"><strong>{gateStatus}</strong></p>
      <p className="text-sm">Beslisgates: dag 30 / dag 60 / dag 90</p>
    </div>
  );
}
