import React from "react";

function Metric({ label, value }: { label: string; value: number | null | undefined }) {
  const v = typeof value === "number" ? value : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[11px] uppercase tracking-[0.35em] text-white/35">{label}</p>
      <p className="text-3xl font-semibold text-[#d4af37] mt-2">
        {v === null ? "—" : v}
      </p>
    </div>
  );
}

export default function Scorecard(props: {
  latest: any;
  averages: any;
  role: string;
  days: number;
}) {
  const l = props.latest ?? {};
  const a = props.averages ?? {};

  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-8 space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-white/40 text-sm">
            Laatste meting — rol: <span className="text-white/70">{props.role}</span> — periode:{" "}
            <span className="text-white/70">{props.days}d</span>
          </p>
          <p className="text-white/30 text-xs mt-1">
            Scores 0–100. Hoger = beter, behalve irreversibility-risico.
          </p>
        </div>

        <div className="text-white/30 text-xs">
          Gemiddelden (periode):{" "}
          <span className="text-white/60">
            {a.overall_governance_health ?? "—"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Metric label="Besluitsnelheid" value={l.decision_velocity} />
        <Metric label="Eigenaarschap" value={l.ownership_clarity} />
        <Metric label="Escalatiefictie" value={l.escalation_friction} />
        <Metric label="Irreversibility risico" value={l.irreversibility_risk} />
        <Metric label="Overall health" value={l.overall_governance_health} />
      </div>
    </section>
  );
}
