import { normalize } from "./storage";

export type StrategicPatternMatch = {
  pattern:
    | "professional_partnership"
    | "cooperatief_kennisbedrijf"
    | "platform_model"
    | "scale_model"
    | "network_model"
    | "ecosystem_strategy"
    | "mission_driven_organization"
    | "klassiek_organisatiemodel";
  rationale: string;
  confidence: number;
};

export type StrategicPatternProfile = {
  primary_pattern: StrategicPatternMatch["pattern"];
  secondary_pattern?: StrategicPatternMatch["pattern"];
  scale_mechanism: string;
  typical_risks: string[];
  growth_strategy: string;
  strategic_interventions: string[];
  boardroom_framing: string;
};

export function matchStrategicPattern(rawInput: string): StrategicPatternMatch {
  const text = normalize(rawInput).toLowerCase();

  const hasOwnership = /(aandelen|mede-eigenaar|aandeelhouder|eigenaarschap)/i.test(text);
  const hasNoMiddle =
    /(geen middenmanagement|geen lagen met middenmanagement|zonder middenmanagement|platte organisatie|platte structuur|korte lijnen|korte lijntjes)/i.test(text);
  const hasTalentFlywheel = /(universiteit|rug|open sollicitaties|lage uitstroom|ziekteverzuim)/i.test(text);
  const hasProfessionalCore = /(mt|directie|leiding).{0,60}(behandelaar|client|cliënt)/i.test(text);
  const hasHybridKnowledgeModel =
    /(70\s*%\s*[\s\S]{0,140}\s*30\s*%|70\s*\/\s*30|70%\s*zorg[\s\S]{0,140}30%\s*ontwikkel)/i.test(text);
  const hasNetwork = /(netwerkorganisatie|netwerkstrategie|partners|allianties|licentie|modeladoptie|maatschappelijke impact)/i.test(text);
  const hasScale = /(opschalen|schaal|cellenmodel|groeien)/i.test(text);
  const hasPolicyInfluence = /(vng|vws|beleid|beleidsinvloed|beweging van nul|gemeentelijke pilot)/i.test(text);
  const hasMissionSignal = /(maatschappelijke impact|waarden|missie|preventie|jeugdhulp|kinderen)/i.test(text);
  const hasPlatformSignal = /(platform|marktplaats|vraag en aanbod|netwerkeffect)/i.test(text);
  const hasGuardrailedGrowth = /(maximaal\s*5\s*fte|5\s*fte\/jaar|groeicap)/i.test(text);
  const molendriftLikeSignals = [
    hasOwnership,
    hasHybridKnowledgeModel,
    hasNoMiddle,
    hasNetwork,
    hasPolicyInfluence,
    hasGuardrailedGrowth,
  ].filter(Boolean).length;

  if (molendriftLikeSignals >= 3 && (hasOwnership || hasNetwork)) {
    return {
      pattern: "professional_partnership",
      rationale:
        "Eigenaarschap, cultuurguardrails en netwerkgedreven schaal wijzen op een professional partnership met replicatie via partners.",
      confidence: 0.9,
    };
  }

  if (
    (hasOwnership && hasNoMiddle && hasTalentFlywheel) ||
    (hasNoMiddle && hasTalentFlywheel && hasProfessionalCore) ||
    (hasHybridKnowledgeModel && hasNoMiddle && (hasOwnership || hasTalentFlywheel))
  ) {
    return {
      pattern: "professional_partnership",
      rationale:
        "Professionals dragen direct eigenaarschap en governance, met platte structuur en sterke retentie als kern van het model.",
      confidence: 0.91,
    };
  }

  if (hasOwnership && hasNoMiddle) {
    return {
      pattern: "cooperatief_kennisbedrijf",
      rationale:
        "Eigenaarschap via participatie, platte governance en talent-retentie vormen samen een coöperatief kennisgedreven model.",
      confidence: 0.9,
    };
  }

  if (hasNetwork) {
    return {
      pattern: "network_model",
      rationale: "Waardecreatie verschuift naar partnernetwerken en maatschappelijke impact buiten eigen volumegroei.",
      confidence: 0.82,
    };
  }

  if (hasPolicyInfluence && hasNetwork) {
    return {
      pattern: "ecosystem_strategy",
      rationale: "De organisatie beïnvloedt actief het systeem via beleidslijnen, partners en sectoradoptie.",
      confidence: 0.84,
    };
  }

  if (hasMissionSignal && (hasNetwork || hasPolicyInfluence)) {
    return {
      pattern: "mission_driven_organization",
      rationale: "Maatschappelijke missie stuurt keuzes; schaal verloopt via bewegingen en netwerken, niet primair via volume.",
      confidence: 0.81,
    };
  }

  if (hasPlatformSignal) {
    return {
      pattern: "platform_model",
      rationale: "Waarde ontstaat door interactie tussen meerdere gebruikersgroepen met potentieel netwerkeffect.",
      confidence: 0.78,
    };
  }

  if (hasScale) {
    return {
      pattern: "scale_model",
      rationale: "Strategie focust op volumegroei/replicatie en vereist expliciete schaalgovernance.",
      confidence: 0.76,
    };
  }

  return {
    pattern: "klassiek_organisatiemodel",
    rationale: "Geen sterk afwijkend patroon gedetecteerd; default organisatiemodel met standaard governance-aannames.",
    confidence: 0.6,
  };
}

export function buildStrategicPatternProfile(rawInput: string): StrategicPatternProfile {
  const match = matchStrategicPattern(rawInput);
  return buildStrategicPatternProfileFromPattern(rawInput, match.pattern);
}

export function buildStrategicPatternProfileFromPattern(
  rawInput: string,
  forcedPrimaryPattern: StrategicPatternMatch["pattern"]
): StrategicPatternProfile {
  const text = normalize(rawInput).toLowerCase();
  const match: StrategicPatternMatch = {
    pattern: forcedPrimaryPattern,
    rationale: "",
    confidence: 1,
  };
  const hasNetwork = /(netwerkorganisatie|partners|alliantie|samenwerking)/i.test(text);
  const hasPolicyInfluence = /(vng|vws|beleid|beweging van nul|gemeente)/i.test(text);
  const hasMission = /(maatschappelijke impact|missie|preventie|jeugdhulp)/i.test(text);
  const hasOwnership = /(aandelen|mede-eigenaar|aandeelhouder|eigenaarschap)/i.test(text);
  const hasCultureCore = /(cultuur|kwaliteit|retentie)/i.test(text);
  const hasGuardrailedGrowth = /(maximaal\s*5\s*fte|5\s*fte\/jaar|groeicap|bewust begrensd)/i.test(text);

  const secondary_pattern: StrategicPatternMatch["pattern"] | undefined =
    match.pattern === "professional_partnership" && hasOwnership && hasCultureCore && hasGuardrailedGrowth
      ? "network_model"
      : 
    match.pattern === "professional_partnership" && hasNetwork
      ? hasPolicyInfluence
        ? "ecosystem_strategy"
        : "network_model"
      : match.pattern === "network_model" && hasMission
        ? "mission_driven_organization"
        : undefined;

  const byPattern: Record<StrategicPatternMatch["pattern"], Omit<StrategicPatternProfile, "primary_pattern" | "secondary_pattern">> = {
    professional_partnership: {
      scale_mechanism: "modelreplicatie via netwerkallianties en kennislicenties",
      typical_risks: ["cultuurverlies bij snelle groei", "kennisafhankelijkheid van sleutelpersonen"],
      growth_strategy: "niet-lineaire schaal via partneradoptie in plaats van interne volumegroei",
      strategic_interventions: ["netwerkallianties", "modelreplicatie", "kennislicenties"],
      boardroom_framing:
        "De organisatie functioneert als professional partnership; schaal moet via modeladoptie verlopen, niet primair via extra personeel.",
    },
    cooperatief_kennisbedrijf: {
      scale_mechanism: "cooperatieve kennisverspreiding en gestandaardiseerde methodiek",
      typical_risks: ["besluittraagheid door consensusdruk", "onduidelijke commerciële prioritering"],
      growth_strategy: "selectieve opschaling met harde governance en eigenaarschapskaders",
      strategic_interventions: ["governance-kaders", "kennisstandaardisatie", "selectieve partnergroei"],
      boardroom_framing:
        "Het model vraagt om strakke besluitdiscipline zodat coöperatief eigenaarschap schaal niet vertraagt.",
    },
    platform_model: {
      scale_mechanism: "netwerkeffecten tussen gebruikersgroepen",
      typical_risks: ["marktplaatsinstabiliteit", "kwaliteitsvariatie bij snelle groei"],
      growth_strategy: "versnel gebruikersgroei met kwaliteitsbewaking op kerninteracties",
      strategic_interventions: ["matching-optimalisatie", "quality gating", "ecosysteem-partnerbeheer"],
      boardroom_framing:
        "Groei is platformgedreven; waarde stijgt via interactiedichtheid en kwaliteitscontrole van het netwerk.",
    },
    scale_model: {
      scale_mechanism: "lineaire volumegroei met processtandaardisatie",
      typical_risks: ["capaciteitsdruk", "marge-erosie bij te snelle uitbreiding"],
      growth_strategy: "gefaseerd schalen met strikte capaciteit- en kwaliteitsdrempels",
      strategic_interventions: ["capaciteitsplanning", "processtandaardisatie", "rendementsdiscipline"],
      boardroom_framing:
        "Het model schaalt lineair; succes hangt af van ritme, standaardisatie en financiële discipline.",
    },
    network_model: {
      scale_mechanism: "partnernetwerk en kennisdeling",
      typical_risks: ["governance-complexiteit", "partnerkwaliteitsvariatie"],
      growth_strategy: "schaal via partners met contractuele kwaliteitsdrempels",
      strategic_interventions: ["partnercertificering", "alliantie-governance", "kwaliteitsaudits"],
      boardroom_framing:
        "De organisatie functioneert als netwerkorganisatie; impact groeit via partnerschappen en niet via interne volumegroei.",
    },
    ecosystem_strategy: {
      scale_mechanism: "ecosysteemadoptie via partners en beleidsinvloed",
      typical_risks: ["afhankelijkheid van externe besluitcycli", "fragmentatie van sturing"],
      growth_strategy: "veranker model in beleidskaders en schaal via systeemadoptie",
      strategic_interventions: ["beleidsallianties", "pilotdeals", "ecosysteem-governance"],
      boardroom_framing:
        "De organisatie beïnvloedt het systeem; schaal verloopt via ecosysteemadoptie en niet alleen via eigen operatie.",
    },
    mission_driven_organization: {
      scale_mechanism: "beweging en netwerkmobilisatie rond maatschappelijke missie",
      typical_risks: ["financieringsdruk", "missiedrift zonder uitvoeringsdiscipline"],
      growth_strategy: "missiegedreven schaal met harde financieel-operationele guardrails",
      strategic_interventions: ["missie-allianties", "impactcontracten", "financiële guardrails"],
      boardroom_framing:
        "Het model is missiegedreven; schaal moet missie-impact en financiële houdbaarheid tegelijk borgen.",
    },
    klassiek_organisatiemodel: {
      scale_mechanism: "interne procesverbetering en gecontroleerde volumegroei",
      typical_risks: ["beperkte differentiatie", "trage adaptatie aan marktdruk"],
      growth_strategy: "stapsgewijze optimalisatie met heldere prioriteiten",
      strategic_interventions: ["portfolio-prioritering", "procesverbetering", "governanceversnelling"],
      boardroom_framing:
        "Het model is klassiek georganiseerd; concurrentiekracht vraagt expliciete keuze op focus en uitvoeringsritme.",
    },
  };

  const base = byPattern[match.pattern];
  return {
    primary_pattern: match.pattern,
    secondary_pattern,
    ...base,
  };
}
