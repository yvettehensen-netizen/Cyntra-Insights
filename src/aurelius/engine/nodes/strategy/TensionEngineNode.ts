import {
  detectRelevantTension,
  type TensionDescriptor,
} from "@/aurelius/engine/visuals/TensionLibrary";

export type DetectedStrategyPattern = {
  pattern: string;
  evidence: string;
  confidenceBoost: number;
};

export type TensionEngineNodeInput = {
  organizationName?: string;
  sector?: string;
  sourceText?: string;
  strategicSignals?: string[];
  organizationMechanics?: string[];
  systemAnalysis?: string[];
  strategicPattern?: string;
  historicalSignals?: string[];
};

export type TensionEngineNodeOutput = {
  coreProblem: string;
  structuralTension: string;
  mechanism: string;
  decisionFocus: string;
  visual: TensionDescriptor;
  structuralConstraints: {
    economics: string;
    capacity: string;
    incentives: string;
    governance: string;
  };
  detectedPatterns: DetectedStrategyPattern[];
  confidence: number;
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function buildSource(input: TensionEngineNodeInput): string {
  return [
    normalize(input.organizationName),
    normalize(input.sector),
    normalize(input.sourceText),
    (input.strategicSignals ?? []).map((item) => normalize(item)).join("\n"),
    (input.organizationMechanics ?? []).map((item) => normalize(item)).join("\n"),
    (input.systemAnalysis ?? []).map((item) => normalize(item)).join("\n"),
    normalize(input.strategicPattern),
    (input.historicalSignals ?? []).map((item) => normalize(item)).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function detectPatterns(source: string): DetectedStrategyPattern[] {
  const patterns: Array<DetectedStrategyPattern | null> = [
    /\bcaseload|wachttijd|werkdruk|capaciteit|personeel\b/i.test(source)
      ? { pattern: "capacity constraint", evidence: "Caseload, wachttijd of personeelsdruk wijzen op een harde capaciteitsgrens.", confidenceBoost: 0.1 }
      : null,
    /\bgemeenten|portfolio|spreiding|breedte|productmix\b/i.test(source)
      ? { pattern: "portfolio imbalance", evidence: "Spreiding over gemeenten, segmenten of productlijnen maakt prioritering strategisch nodig.", confidenceBoost: 0.1 }
      : null,
    /\bmarge|tarief|prijs|reistijd|no-show|kostprijs\b/i.test(source)
      ? { pattern: "structural cost asymmetry", evidence: "Kosten en opbrengsten bewegen niet gelijk op door tarief-, reistijd- of no-show-verschillen.", confidenceBoost: 0.08 }
      : null,
    /\bcontract|consortium|gemeentelijke inkoop|plafond\b/i.test(source)
      ? { pattern: "contract dependency", evidence: "Instroom of economische ruimte wordt begrensd door contracten en externe toegang.", confidenceBoost: 0.08 }
      : null,
    /\bgovernance|mandaat|partner|triage|escalatie\b/i.test(source)
      ? { pattern: "governance fragmentation", evidence: "Mandaat, triage of escalatie ligt verspreid over meerdere partijen of lijnen.", confidenceBoost: 0.06 }
      : null,
  ];

  return patterns.filter((item): item is DetectedStrategyPattern => Boolean(item));
}

function buildCoreProblem(tension: TensionDescriptor): string {
  if (tension.id === "portfolio-capacity") {
    return "Een breed gemeentenportfolio legt meer variatie in contractcondities en instroom op de organisatie dan vaste teams operationeel en economisch kunnen absorberen.";
  }
  if (tension.id === "growth-culture") {
    return "Het groeitempo vraagt meer absorptievermogen van teams en leiderschap dan de cultuur en kennisoverdracht nu kunnen dragen.";
  }
  if (tension.id === "margin-accessibility") {
    return "De organisatie probeert brede toegankelijkheid te behouden terwijl tarief- en kostenlogica de margeruimte al uithollen.";
  }
  if (tension.id === "scale-quality") {
    return "Schaalambitie groeit sneller dan de kwaliteitsborging en implementatiecapaciteit kunnen volgen.";
  }
  return "Versnellingsdruk vergroot het aantal besluiten en uitzonderingen sneller dan mandaat en governance kunnen verwerken.";
}

function buildMechanism(source: string, tension: TensionDescriptor): string {
  if (tension.id === "portfolio-capacity") {
    const hasCulture = /\bwerkplezier|retentie|lage uitstroom|vaste medewerkers|verbinding\b/i.test(source);
    return hasCulture
      ? "Het economische model wordt bepaald door gemeentelijke contractcondities, reistijd en no-show, terwijl de feitelijke productiecapaciteit wordt gedragen door vaste teams met hoge retentie. Daardoor vergroot extra gemeentenspreiding niet lineair de output, maar vooral de druk op caseload, wachttijd, teamstabiliteit en marge."
      : "Gemeentelijke contractcondities en instroomroutes variëren per regio, terwijl teamcapaciteit beperkt planbaar is. Daardoor vergroot extra spreiding sneller de druk op caseload, wachttijd en marge dan op daadwerkelijke productie.";
  }
  if (tension.id === "growth-culture") {
    return "Nieuwe groei vraagt direct om onboarding, leiderschap en ritme in besluitvorming. Als die laag niet even snel opschaalt, verschuift druk naar retentie, kwaliteitsvariatie en interne ruis.";
  }
  if (tension.id === "margin-accessibility") {
    return "Meer toegankelijkheid voegt vraag toe, maar onder vaste tarieven of hoge servicevariatie daalt de economische kwaliteit van dezelfde extra instroom. De spanning wordt pas bestuurbaar als toegang en marge in hetzelfde ritme worden gestuurd.";
  }
  if (tension.id === "scale-quality") {
    return "Extra schaal verhoogt volume en complexiteit tegelijk. Zonder sterke kwaliteitsgates en implementatiediscipline verschuift de winst van schaal naar herstelwerk en reputatiedruk.";
  }
  return "Sneller bewegen lijkt strategisch nodig, maar zonder expliciet mandaat groeit het aantal uitzonderingen, herbesluiten en escalaties. Daardoor wordt snelheid omgezet in bestuurlijke frictie.";
}

function buildDecisionFocus(tension: TensionDescriptor): string {
  if (tension.id === "portfolio-capacity") return "Bestuurlijke keuze: gemeentenportfolio rationaliseren, alleen gecontroleerd capaciteit toevoegen, of instroom- en zorgmodel fundamenteel herontwerpen.";
  if (tension.id === "growth-culture") return "Bestuurlijke keuze: groei temporiseren, management- en teamstructuur eerst versterken, of selectiever in marktsegmenten bewegen.";
  if (tension.id === "margin-accessibility") return "Bestuurlijke keuze: toegankelijkheid begrenzen, contract- of productmix herijken, of de kostendiscipline per route hard maken.";
  if (tension.id === "scale-quality") return "Bestuurlijke keuze: schaal vertragen, het leveringsmodel standaardiseren, of kwaliteitsgates zwaarder maken voordat volume groeit.";
  return "Bestuurlijke keuze: mandaat centraliseren, uitzonderingsroutes sluiten, of groeiversnelling pas toestaan na governance-herstel.";
}

function buildConstraints(tension: TensionDescriptor): TensionEngineNodeOutput["structuralConstraints"] {
  if (tension.id === "portfolio-capacity") {
    return {
      economics: "Tariefverschillen, reistijd en no-show maken dezelfde zorgvorm per gemeente economisch ongelijk.",
      capacity: "Caseload, wachttijd en vaste-teamstabiliteit begrenzen hoeveel extra instroom uitvoerbaar blijft.",
      incentives: "Externe toegang stimuleert brede beschikbaarheid, terwijl interne teams worden afgerekend op kwaliteit, continuiteit en rendabiliteit.",
      governance: "Consortiumtriage en gemeentelijke contractsturing leggen een deel van de vraagvorming buiten directe bestuurscontrole.",
    };
  }
  if (tension.id === "growth-culture") {
    return {
      economics: "Groei levert pas waarde als retentie, productiviteit en kwaliteitskosten meebewegen.",
      capacity: "Leiding, onboarding en kennisoverdracht schalen trager dan commerciële of bestuurlijke ambitie.",
      incentives: "De organisatie beloont vaak nieuwe groei sneller dan het beschermen van teamstabiliteit.",
      governance: "Zonder ritme in prioritering blijven te veel initiatieven parallel openstaan.",
    };
  }
  if (tension.id === "margin-accessibility") {
    return {
      economics: "Meer bereik is niet automatisch rendabel binnen vaste tarieven, servicebeloften of hoge variantie.",
      capacity: "Extra toegankelijkheid verhoogt druk op planning, doorlooptijd en intake.",
      incentives: "De buitenwereld beloont bereik, terwijl de binnenkant wordt afgerekend op economische discipline.",
      governance: "Zonder expliciete grenzen verschuift het moeilijke toegangsbesluit van bestuur naar operatie.",
    };
  }
  if (tension.id === "scale-quality") {
    return {
      economics: "Herstelwerk en kwaliteitsverlies neutraliseren snel het schaalvoordeel.",
      capacity: "Implementatiecapaciteit en kwaliteitscontrole zijn de echte bottlenecks.",
      incentives: "Teams ervaren volumeprikkels sneller dan kwaliteitsprikkels.",
      governance: "Bestuur moet bepalen welke kwaliteitsgates niet onder groeidruk mogen wijken.",
    };
  }
  return {
    economics: "Besluitverlies en uitzonderingswerk maken snelheid duurder dan zichtbaar is in de P&L.",
    capacity: "Meer tempo vergroot de coordinatielast op dezelfde leiderschapslaag.",
    incentives: "Snelle uitzonderingen worden beloond, structurele governance-hygiene minder.",
    governance: "Mandaat, escalatie en review-ritme bepalen of snelheid bestuurbaar blijft.",
  };
}

function formatBlock(output: Omit<TensionEngineNodeOutput, "block">): string {
  return [
    "### Strategy Tension Engine",
    "",
    "CORE PROBLEM",
    output.coreProblem,
    "",
    "STRUCTURAL TENSION",
    output.structuralTension,
    "",
    "MECHANISM",
    output.mechanism,
    "",
    "DECISION FOCUS",
    output.decisionFocus,
    "",
    "VISUAL",
    `${output.visual.leftPole} <-> ${output.visual.rightPole}`,
    output.visual.explanation,
  ].join("\n");
}

export function runTensionEngineNode(input: TensionEngineNodeInput): TensionEngineNodeOutput {
  const source = buildSource(input);
  const detectedPatterns = detectPatterns(source);
  const visual = detectRelevantTension(source);
  const output = {
    coreProblem: buildCoreProblem(visual),
    structuralTension: `The real strategic tension is ${visual.label}.`,
    mechanism: buildMechanism(source, visual),
    decisionFocus: buildDecisionFocus(visual),
    visual,
    structuralConstraints: buildConstraints(visual),
    detectedPatterns,
    confidence: Math.min(0.66 + detectedPatterns.reduce((sum, item) => sum + item.confidenceBoost, 0), 0.98),
  };
  return { ...output, block: formatBlock(output) };
}
