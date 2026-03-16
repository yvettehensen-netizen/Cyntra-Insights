export type DecisionConsequenceNodeInput = {
  executiveThesis?: string;
  strategicOptions?: string[];
  recommendedChoice?: string;
  sectorContext?: string | string[];
  facts?: string[];
  interventions?: string[];
  boardroomStressTest?: string;
  organizationName?: string;
};

export type DecisionConsequences = {
  decision: string;
  horizon12m: string;
  horizon24m: string;
  horizon36m: string;
  strategicOutcome: string;
  riskIfWrong: string;
};

export type DecisionConsequenceNodeOutput = {
  decisionConsequences: DecisionConsequences;
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function inferDecisionLabel(recommendedChoice: string, strategicOptions: string): string {
  const explicit = normalize(recommendedChoice);
  if (explicit) return explicit;
  const match = strategicOptions.match(/^[ABC][.)]\s*(.+)$/m);
  return match ? normalize(match[0]) : "Kies de bestuurlijk best beheersbare richting met expliciete prioriteit.";
}

function isYouthOrPublicContext(text: string): boolean {
  return /\bjeugdzorg|gemeente|gemeentelijke|jeugdwet|wijkteam|zorg\b/i.test(text);
}

function isScaleModelContext(text: string): boolean {
  return /\bnetwerk|licentie|replicatie|partner|cellenmodel|schaal\b/i.test(text);
}

function formatBlock(value: DecisionConsequences): string {
  return [
    `Besluit: ${value.decision}`,
    "12 maanden",
    value.horizon12m,
    "24 maanden",
    value.horizon24m,
    "36 maanden",
    value.horizon36m,
    "Strategisch eindbeeld",
    value.strategicOutcome,
    "Risico als aanname fout is",
    value.riskIfWrong,
  ].join("\n");
}

function buildFallbackSimulation(input: DecisionConsequenceNodeInput): DecisionConsequences {
  const source = [toText(input.sectorContext), toText(input.facts), toText(input.interventions), normalize(input.boardroomStressTest)]
    .filter(Boolean)
    .join("\n");
  const decision = inferDecisionLabel(normalize(input.recommendedChoice), toText(input.strategicOptions));

  if (isYouthOrPublicContext(source)) {
    return {
      decision,
      horizon12m:
        "Binnen 12 maanden verschuift de druk van ad-hoc volume naar strakkere triage, contractdiscipline en voorspelbaardere capaciteitssturing.",
      horizon24m:
        "Binnen 24 maanden wordt duidelijk of de organisatie contractmatig en inhoudelijk scherper gepositioneerd raakt richting gemeenten en verwijzers.",
      horizon36m:
        "Binnen 36 maanden ontstaat een kleinere maar bestuurlijk stabielere organisatie, of juist verdere erosie als positionering en contractkwaliteit uitblijven.",
      strategicOutcome:
        "De organisatie groeit dan minder op volume en meer op contractkwaliteit, behandelcontinuiteit en onderscheidende rol in de regio.",
      riskIfWrong:
        "Als de aanname fout is, kopen gemeenten capaciteit elders in en blijft de organisatie achter met hogere druk maar zonder sterkere marktpositie.",
    };
  }

  if (isScaleModelContext(source)) {
    return {
      decision,
      horizon12m:
        "Binnen 12 maanden verschuift de organisatie van interne volumegroei naar selectie van schaalmechanismen, partnerdiscipline en bestuurlijke kwaliteitscontroles.",
      horizon24m:
        "Binnen 24 maanden wordt zichtbaar of replicatie, partnerschap of standaardisatie echt extra impact oplevert zonder cultuur- en kwaliteitsverlies.",
      horizon36m:
        "Binnen 36 maanden ontwikkelt de organisatie zich tot schaalbaar model met overdraagbare werkwijze, of valt zij terug in complexe aansturing zonder hefboom.",
      strategicOutcome:
        "Het eindbeeld is een organisatie die minder groeit via extra FTE en meer via reproduceerbaar model, netwerk en kwaliteitsborging.",
      riskIfWrong:
        "Als de aanname fout is, groeit bestuurlijke complexiteit sneller dan impact en verliest de organisatie kwaliteit, snelheid en marge tegelijk.",
    };
  }

  return {
    decision,
    horizon12m:
      "Binnen 12 maanden worden de eerste operationele consequenties zichtbaar in werkdruk, uitvoerbaarheid en prioriteitsdiscipline.",
    horizon24m:
      "Binnen 24 maanden wordt duidelijk of de gekozen richting structureel meer focus, betere allocatie en hogere bestuurlijke voorspelbaarheid oplevert.",
    horizon36m:
      "Binnen 36 maanden vertaalt de keuze zich in sterkere strategische positie of juist in opgeschaalde frictie door verkeerde aannames.",
    strategicOutcome:
      "Het strategisch eindbeeld is een organisatie die explicieter kiest en daardoor bestuurlijk beter te sturen is dan in het huidige parallelle model.",
    riskIfWrong:
      "Als de kernhypothese fout is, stapelen kosten, spanningen en reputatierisico zich op voordat het bestuur kan bijsturen.",
  };
}

export function runDecisionConsequenceNode(
  input: DecisionConsequenceNodeInput
): DecisionConsequenceNodeOutput {
  const thesis = normalize(input.executiveThesis);
  const strategicOptions = toText(input.strategicOptions);
  const sectorContext = toText(input.sectorContext);
  const facts = toText(input.facts);
  const interventions = toText(input.interventions);
  const stress = normalize(input.boardroomStressTest);
  const source = [thesis, strategicOptions, sectorContext, facts, interventions, stress].filter(Boolean).join("\n\n");
  const decision = inferDecisionLabel(normalize(input.recommendedChoice), strategicOptions);

  const fallback = buildFallbackSimulation(input);
  let decisionConsequences: DecisionConsequences = fallback;

  if (isYouthOrPublicContext(source)) {
    decisionConsequences = {
      decision,
      horizon12m:
        "Binnen 12 maanden stabiliseren wachtdruk en teamdruk alleen als triage, caseloadsturing en contractdiscipline tegelijk worden aangescherpt.",
      horizon24m:
        "Binnen 24 maanden verschuift de organisatie van brede uitvoerder naar scherper gepositioneerde aanbieder met beter verdedigbare contractmix en lagere bestuurlijke ruis.",
      horizon36m:
        "Binnen 36 maanden ontstaat een stabielere positie als specialistische of regionaal ingebedde partner, met minder volumefixatie en meer contractkwaliteit.",
      strategicOutcome:
        "De organisatie groeit dan niet primair in volume, maar in behandelkwaliteit, contractpositie, verwijzersvertrouwen en bestuurlijke beheersbaarheid.",
      riskIfWrong:
        "Als wachttijdreductie, positionering of contractdiscipline uitblijven, verschuift vraag naar andere aanbieders terwijl werkdruk en kwetsbaarheid intern hoog blijven.",
    };
  } else if (isScaleModelContext(source)) {
    decisionConsequences = {
      decision,
      horizon12m:
        "Binnen 12 maanden verschuift de organisatie van groei via extra mensen naar groei via partnerselectie, standaardisatie en expliciete kwaliteitsremmen.",
      horizon24m:
        "Binnen 24 maanden wordt zichtbaar of schaalmechanismen echt repliceerbaar zijn zonder verlies van cultuur, besluitdiscipline en klant- of cliëntkwaliteit.",
      horizon36m:
        "Binnen 36 maanden bouwt de organisatie een overdraagbaar model met hogere impact per FTE, of raakt zij juist gevangen in bestuurlijke complexiteit zonder schaalhefboom.",
      strategicOutcome:
        "Het eindbeeld is een organisatie die impact vergroot via model, netwerk en governance in plaats van lineaire capaciteitsuitbreiding.",
      riskIfWrong:
        "Als de schaalhypothese fout is, stijgen partner- en governancekosten sneller dan de extra waarde, waardoor marge en reputatie tegelijk onder druk komen.",
    };
  }

  const validated: DecisionConsequences = {
    decision: normalize(decisionConsequences.decision) || fallback.decision,
    horizon12m: normalize(decisionConsequences.horizon12m) || fallback.horizon12m,
    horizon24m: normalize(decisionConsequences.horizon24m) || fallback.horizon24m,
    horizon36m: normalize(decisionConsequences.horizon36m) || fallback.horizon36m,
    strategicOutcome: normalize(decisionConsequences.strategicOutcome) || fallback.strategicOutcome,
    riskIfWrong: normalize(decisionConsequences.riskIfWrong) || fallback.riskIfWrong,
  };

  return {
    decisionConsequences: validated,
    block: formatBlock(validated),
  };
}
