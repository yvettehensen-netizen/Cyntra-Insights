import type { GovernanceControlOutput } from "@/cyntra/governance-control";

interface GovernanceStatusLayerProps {
  governanceControl: GovernanceControlOutput;
}

function stateLabel(state: GovernanceControlOutput["state"]): string {
  if (state === "CONTROLLED") return "BEHEERST";
  if (state === "AT_RISK") return "VERHOOGD RISICO";
  return "ESCALATIE VEREIST";
}

function stateStyle(state: GovernanceControlOutput["state"]): string {
  if (state === "CONTROLLED") {
    return "border-emerald-300/45 text-emerald-200";
  }
  if (state === "AT_RISK") {
    return "border-amber-300/45 text-amber-200";
  }
  return "border-red-300/55 text-red-200";
}

function summaryLine1(governanceControl: GovernanceControlOutput): string {
  if (governanceControl.state === "CONTROLLED") {
    return "Strategische stabiliteit is aantoonbaar binnen vastgestelde governancebandbreedte.";
  }
  if (governanceControl.state === "AT_RISK") {
    return "Materiële afwijking gedetecteerd; bestuurlijke bijsturing binnen huidig besluitvenster vereist.";
  }
  return "Escalatiedrempel overschreden; formeel interventiebesluit is bestuurlijk verplicht.";
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("nl-NL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GovernanceStatusLayer({
  governanceControl,
}: GovernanceStatusLayerProps) {
  return (
    <section
      className="rounded-3xl border border-white/20 bg-[#0b0d11] p-5"
      aria-label="Bestuurlijke statuslaag"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-wide text-white">
          Bestuurlijke status:{" "}
          <span className={`rounded-md border px-2 py-1 text-sm ${stateStyle(governanceControl.state)}`}>
            {stateLabel(governanceControl.state)}
          </span>
        </h2>
        <p className="text-xs text-white/55">
          Laatste update:{" "}
          <span className="font-medium text-white/75">
            {formatTimestamp(governanceControl.updated_at)}
          </span>
        </p>
      </div>

      <p className="mt-3 text-sm text-white/92">{summaryLine1(governanceControl)}</p>
      <p className="mt-1 text-sm text-white/72">
        SRI {governanceControl.sri.toFixed(1)} · Board-adoptie-index{" "}
        {governanceControl.board_index.toFixed(1)} · Risicoversnelling{" "}
        {governanceControl.risk_acceleration.toFixed(2)} · Driftkwadrant{" "}
        {governanceControl.drift_quadrant}
      </p>
    </section>
  );
}
