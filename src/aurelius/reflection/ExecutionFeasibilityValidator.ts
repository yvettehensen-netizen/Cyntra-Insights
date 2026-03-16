export type ExecutionFeasibilityInput = {
  boardroomReport: string;
};

export type ExecutionFeasibilityEntry = {
  intervention: string;
  risk: "laag" | "middel" | "hoog";
  reason: string;
  mitigation: string;
};

export type ExecutionFeasibilityResult = {
  entries: ExecutionFeasibilityEntry[];
  validationText: string;
  hasHighRisk: boolean;
};

function extractSection(text: string, heading: string): string {
  const source = String(text ?? "");
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function splitSentences(text: string): string[] {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractInterventions(sectionText: string): string[] {
  const sentences = splitSentences(sectionText);
  const candidates = sentences.filter((sentence) =>
    /\b(actie|interventie|contractvloer|margekaart|besluittafel|75%-norm|capaciteit|escalatie|stopregel|verbreding)\b/i.test(
      sentence
    )
  );
  const selected = (candidates.length ? candidates : sentences).slice(0, 6);
  return selected.length ? selected : ["Geen expliciete interventies gevonden in sectie 10."];
}

function assessRisk(intervention: string): ExecutionFeasibilityEntry["risk"] {
  if (/\b(contract|verzekeraar|mandaat|centrale sturing|stopregel|portfolio)\b/i.test(intervention)) {
    return "hoog";
  }
  if (/\b(capaciteit|planning|productiviteit|norm|escalatie|governance)\b/i.test(intervention)) {
    return "middel";
  }
  return "laag";
}

function buildReason(intervention: string, risk: ExecutionFeasibilityEntry["risk"]): string {
  if (risk === "hoog") {
    return `Deze interventie raakt externe afhankelijkheden of bestuurlijke machtsverdeling direct: ${intervention}`;
  }
  if (risk === "middel") {
    return `Deze interventie vraagt strak uitvoeringsritme en gedragsverandering in teams: ${intervention}`;
  }
  return `Deze interventie is operationeel uitvoerbaar met beperkte structurele weerstand: ${intervention}`;
}

function buildMitigation(intervention: string, risk: ExecutionFeasibilityEntry["risk"]): string {
  if (risk === "hoog") {
    return "Mitigeer via scenariovergelijking met expliciete trade-off op volumeverlies versus margeherstel en besluit met vooraf gedefinieerde escalatieregels.";
  }
  if (risk === "middel") {
    return "Mitigeer via maandritme met eigenaar, KPI, correctie binnen 7 dagen en centrale opvolging van blokkades.";
  }
  return "Mitigeer via wekelijkse voortgangscontrole en directe correctie op afwijkingen.";
}

function toValidationText(entries: ExecutionFeasibilityEntry[]): string {
  const body = entries
    .map(
      (entry) =>
        `Interventie: ${entry.intervention} Uitvoeringsrisico: ${entry.risk}. Waarom: ${entry.reason} Mitigatie: ${entry.mitigation}`
    )
    .join("\n\n");

  return `EXECUTION VALIDATION\n\n${body}`.trim();
}

export function validateExecutionFeasibility(
  input: ExecutionFeasibilityInput
): ExecutionFeasibilityResult {
  const report = String(input.boardroomReport ?? "").trim();
  const interventionSection = extractSection(report, "### 10. 90-DAGEN INTERVENTIEPROGRAMMA");
  const interventions = extractInterventions(interventionSection);

  const entries = interventions.map((intervention) => {
    const risk = assessRisk(intervention);
    return {
      intervention,
      risk,
      reason: buildReason(intervention, risk),
      mitigation: buildMitigation(intervention, risk),
    };
  });

  return {
    entries,
    validationText: toValidationText(entries),
    hasHighRisk: entries.some((entry) => entry.risk === "hoog"),
  };
}

