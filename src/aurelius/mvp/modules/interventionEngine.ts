import type {
  InterventionEngineOutput,
  KillerInsightOutput,
  SignalExtractionOutput,
  StrategicConflictOutput,
} from "../types";

export function interventionEngine(params: {
  signals: SignalExtractionOutput;
  conflict: StrategicConflictOutput;
  insight: KillerInsightOutput;
}): InterventionEngineOutput {
  const { signals } = params;
  const hasWaitlist = signals.facts.some((item) => /wachttijd|capaciteit/i.test(item));
  const hasNetwork = signals.patterns.some((item) => /network/i.test(item));

  const interventions = [
    {
      title: "Besluitkader met kill-switch",
      leverage: "standaardisatie" as const,
      action: "Leg 1 bestuurlijk besluitkader vast met escalatieregels en herbesluitmomenten.",
      goal: "100% van schaalbesluiten expliciet langs boardtoets binnen 90 dagen.",
      risk: "Te zware governance kan uitvoeringssnelheid verlagen.",
    },
    {
      title: "Modelreplicatie via partners",
      leverage: "netwerk" as const,
      action: "Selecteer en contracteer 3 implementatiepartners met harde kwaliteitsdrempels.",
      goal: "3 actieve partners binnen 24 maanden.",
      risk: "Partnerkwaliteit varieert en kan reputatie beschadigen.",
    },
  ];

  if (hasWaitlist) {
    interventions.unshift({
      title: "Regionale triage-opschaling",
      leverage: "capaciteit",
      action: "Schaal wachttijdtriage op met uniform script en follow-up governance.",
      goal: "Kort-traject uitstroom van 8% naar 20% in 12 maanden.",
      risk: "Regionale uitvoeringsvariatie zonder centrale borging.",
    });
  }

  if (!hasNetwork) {
    interventions.push({
      title: "Kennis- en overdrachtsprotocol",
      leverage: "kennis",
      action: "Standaardiseer overdraagbare elementen van het model in 1 partner playbook.",
      goal: "1 gevalideerd replicatieprotocol binnen 120 dagen.",
      risk: "Overstandaardisatie kan lokale autonomie verzwakken.",
    });
  }

  return { interventions: interventions.slice(0, 5) };
}

