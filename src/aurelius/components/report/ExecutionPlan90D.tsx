export default function ExecutionPlan90D({ plan }: { plan: any }) {
  if (!plan) return null;

  return (
    <section className="space-y-8 rounded-2xl border border-[#d8b4fe] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#7e22ce]">
        90-dagen executieplan
      </h2>
      <p className="text-sm text-[#6b21a8] font-semibold">
        Concreet uitvoeringsritme met eigenaarschap, KPI's, deadlines en escalatie.
      </p>

      <p className="text-[#581c87] font-semibold">{plan.objective}</p>

      {plan.months.map((m: any) => (
        <div key={m.month} className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4">
          <h3 className="text-lg font-bold text-[#7e22ce]">
            Maand {m.month} — {m.focus}
          </h3>

          {m.steps.map((s: any, i: number) => (
            <p key={i} className="mt-4 rounded-lg border border-[#f3e8ff] bg-white p-3 text-[#581c87] font-semibold">
              <strong>Week {s.week}</strong>: {s.action}<br />
              <em>{s.owner}</em><br />
              {s.metric ? <>KPI: {s.metric}<br /></> : null}
              {s.deadline ? <>Deadline: {s.deadline}<br /></> : null}
              {s.escalation ? <>Escalatie: {s.escalation}<br /></> : null}
              {s.caseAnchor ? <>Broncitaat: "{s.caseAnchor}"</> : null}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
