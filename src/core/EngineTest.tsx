import { engineSmokeTest } from "./engineSmokeTest";

export default function EngineTest() {
  const result = engineSmokeTest();

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 860,
        margin: "40px auto",
        borderRadius: 16,
        border: `1px solid ${result.ok ? "#16a34a" : "#dc2626"}`,
        background: result.ok ? "#052e1a" : "#2a0a0a",
        color: "white",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 22 }}>
        {result.ok
          ? "Engine test: GROEN"
          : "Engine test: FOUT"}
      </h1>
      <p style={{ marginTop: 10, marginBottom: 16, opacity: 0.9 }}>
        {result.summary}
      </p>

      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
        {result.checks.map((check) => (
          <li key={check.label}>
            {check.ok ? "OK" : "FAIL"} — {check.label}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 12, opacity: 0.8 }}>
        Laatste run: {new Date(result.timestamp).toLocaleString("nl-NL")}
      </p>
    </div>
  );
}
