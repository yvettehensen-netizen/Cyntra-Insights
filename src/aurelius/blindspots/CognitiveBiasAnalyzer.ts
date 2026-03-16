export type CognitiveBiasFinding = {
  bias: "bevestigingsbias" | "status_quo_bias" | "optimismebias" | "conflictvermijding";
  signal: string;
  risk: string;
};

export type CognitiveBiasInput = {
  contextText: string;
  hypothesisText: string;
  causalText: string;
};

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export function analyzeCognitiveBiases(input: CognitiveBiasInput): CognitiveBiasFinding[] {
  const source = [input.contextText, input.hypothesisText, input.causalText]
    .filter(Boolean)
    .join("\n\n")
    .toLowerCase();

  const findings: CognitiveBiasFinding[] = [];

  if (hasAny(source, [/\bbevestig/i, /\beigen gelijk\b/i, /\bselectief\b/i])) {
    findings.push({
      bias: "bevestigingsbias",
      signal: "Signalen worden selectief geïnterpreteerd om bestaand beleid te bevestigen.",
      risk: "Tegenbewijs wordt te laat erkend waardoor correctie duurder wordt.",
    });
  }

  if (hasAny(source, [/\bstatus quo\b/i, /\bbestaande routine\b/i, /\bzoals altijd\b/i])) {
    findings.push({
      bias: "status_quo_bias",
      signal: "Bestaande routines krijgen voorrang boven noodzakelijke herprioritering.",
      risk: "Structurele problemen worden genormaliseerd in plaats van opgelost.",
    });
  }

  if (hasAny(source, [/\bgroei lost\b/i, /\bkomt goed\b/i, /\boptimistisch\b/i])) {
    findings.push({
      bias: "optimismebias",
      signal: "Verwachtingen over groei of verbetering zijn sterker dan de onderliggende bewijsbasis.",
      risk: "Besluiten worden genomen op te gunstige aannames met financieel neerwaarts risico.",
    });
  }

  if (hasAny(source, [/\bconflictmijding\b/i, /\bvermijd/i, /\buitstel\b/i, /\bconsensusdruk\b/i])) {
    findings.push({
      bias: "conflictvermijding",
      signal: "Spanning wordt uitgesteld in plaats van bestuurlijk geadresseerd.",
      risk: "Besluitvertraging stapelt zich op en tast executiekracht aan.",
    });
  }

  if (!findings.length) {
    findings.push({
      bias: "conflictvermijding",
      signal: "Geen expliciete biasmarkeringen; impliciete conflictmijding blijft plausibel.",
      risk: "Onzichtbare spanningen kunnen alsnog tot uitstelgedrag leiden.",
    });
  }

  return findings.slice(0, 4);
}
