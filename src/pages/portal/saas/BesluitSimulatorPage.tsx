import { useMemo, useState } from "react";
import { StrategicDecisionSimulator } from "@/aurelius/boardroom";
import { EmptyState, PageShell, Panel } from "./ui";

export default function BesluitSimulatorPage() {
  const simulator = useMemo(() => new StrategicDecisionSimulator(), []);
  const [contextText, setContextText] = useState(
    "Organisatie ervaart margedruk, contractbeperking en capaciteitsfrictie."
  );
  const [result, setResult] = useState<{
    scenario_A: unknown;
    scenario_B: unknown;
    scenario_C: unknown;
  } | null>(null);

  function runSimulation() {
    setResult(
      simulator.simulate({
        context_text: contextText,
        sector: "Zorg/GGZ",
        dominant_problem: "Parallelle ambities verhogen uitvoeringsrisico",
      })
    );
  }

  return (
    <PageShell title="Besluit simulator" subtitle="Simuleer strategische opties en vergelijk scenario-uitkomsten voor boardbesluiten.">
      <Panel title="Scenario input">
        <textarea className="min-h-[140px] w-full rounded-lg border border-white/20 bg-black/20 p-2 text-sm text-gray-100" value={contextText} onChange={(e) => setContextText(e.target.value)} />
        <button className="mt-3 rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black" onClick={runSimulation}>
          Simulatie uitvoeren
        </button>
      </Panel>
      <Panel title="Simulatieresultaten">
        {!result ? (
          <EmptyState text="Nog geen simulatie uitgevoerd." />
        ) : (
          <div className="space-y-2 text-xs text-gray-200">
            <p><strong>Scenario A:</strong> {JSON.stringify(result.scenario_A)}</p>
            <p><strong>Scenario B:</strong> {JSON.stringify(result.scenario_B)}</p>
            <p><strong>Scenario C:</strong> {JSON.stringify(result.scenario_C)}</p>
          </div>
        )}
      </Panel>
    </PageShell>
  );
}

