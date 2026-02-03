export default function ExecutionPlan90D({ plan }: { plan: any }) {
  if (!plan) return null;

  return (
    <section className="space-y-10 executive-verdict">
      <h2 className="text-xl font-semibold">
        90-dagen executieplan
      </h2>

      <p>{plan.objective}</p>

      {plan.months.map((m: any) => (
        <div key={m.month}>
          <h3 className="text-lg">
            Maand {m.month} — {m.focus}
          </h3>

          {m.steps.map((s: any, i: number) => (
            <p key={i}>
              <strong>Week {s.week}</strong>: {s.action}<br />
              <em>{s.owner}</em>
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
