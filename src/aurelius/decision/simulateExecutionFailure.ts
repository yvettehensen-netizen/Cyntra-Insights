// ============================================================
// AURELIUS — EXECUTION FAILURE SIMULATION
// ROUTE: src/aurelius/decision/simulateExecutionFailure.ts
//
// DOEL:
// - Simuleert waar uitvoering breekt bij falen
// - Dwingt bestuur om consequenties expliciet te maken
// ============================================================

export interface ExecutionFailureSimulation {
  likelyFailureWeek: number;
  failureCause: string;
  organisationalImpact: string;
}

export function simulateExecutionFailure(
  text: string
): ExecutionFailureSimulation {
  const lc = text.toLowerCase();

  let failureCause = "Onduidelijk eigenaarschap";
  let impact = "Besluit verdampt in operatie";

  if (lc.includes("mandaat")) {
    failureCause = "Mandaat wordt alsnog betwist";
    impact = "Escalatie naar bestuur en vertraging";
  }

  if (lc.includes("cultuur") || lc.includes("gedrag")) {
    failureCause = "Gedrag verandert niet";
    impact = "Stil verzet ondermijnt uitvoering";
  }

  if (lc.includes("resources") || lc.includes("capaciteit")) {
    failureCause = "Onvoldoende middelen vrijgemaakt";
    impact = "Executie stopt in week 5–6";
  }

  return {
    likelyFailureWeek: 6,
    failureCause,
    organisationalImpact: impact,
  };
}
