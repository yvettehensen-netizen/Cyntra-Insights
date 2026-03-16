import type { SignalExtractionOutput } from "../types";

function normalize(value: string): string {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function signalExtraction(input: string): SignalExtractionOutput {
  const text = normalize(input);
  const lower = text.toLowerCase();

  const facts: string[] = [];
  const tensions: string[] = [];
  const patterns: string[] = [];
  const anomalies: string[] = [];

  if (/ziekteverzuim/.test(lower)) facts.push("Ziekteverzuim is een expliciet operationeel signaal.");
  if (/max(imaal)?\s*\d+\s*fte/.test(lower)) facts.push("Groei wordt expliciet begrensd via FTE-cap.");
  if (/aandeel|eigenaarschap|mede-eigenaar/.test(lower)) facts.push("Eigenaarschap is onderdeel van het organisatiemodel.");
  if (/netwerk|partners|alliantie/.test(lower)) facts.push("Netwerk is benoemd als schaalroute.");
  if (/wachttijd|wachtlijst/.test(lower)) facts.push("Capaciteitsdruk is zichtbaar via wachttijdsignalen.");

  if (/kwaliteit/.test(lower) && /schaal|groei/.test(lower)) {
    tensions.push("kwaliteit beschermen vs schaal vergroten");
  }
  if (/autonomie/.test(lower) && /controle|governance/.test(lower)) {
    tensions.push("professionele autonomie vs bestuurlijke controle");
  }
  if (!tensions.length) tensions.push("impact vergroten vs kernmechanisme beschermen");

  if (/netwerk/.test(lower)) patterns.push("network model");
  if (/eigenaarschap|aandeel/.test(lower)) patterns.push("professional partnership");
  if (/beleid|vng|vws/.test(lower)) patterns.push("ecosystem influence");

  if (/2[,.]3%/.test(lower) && /5[,.]0%/.test(lower)) {
    anomalies.push("In brondata staan meerdere ziekteverzuimwaarden; bronharmonisatie vereist.");
  }
  if (!anomalies.length && /undefined|null|placeholder/.test(lower)) {
    anomalies.push("Onvolledige bronvelden gedetecteerd.");
  }

  if (!facts.length) facts.push("Beperkte expliciete feiten gevonden; aanvullende broninput nodig.");

  return { facts, tensions, patterns, anomalies };
}

