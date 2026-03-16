export type StrategicPatternName =
  | "contractorganisatie"
  | "capaciteitsorganisatie"
  | "platformorganisatie"
  | "specialist"
  | "portfolio-organisatie"
  | "netwerkorganisatie"
  | "missieorganisatie";

export type StrategicPatternEngineInput = {
  sector?: string;
  sourceText?: string;
  dominantRisk?: string;
  decisionOptions?: string[];
  recommendedOption?: string;
};

export type StrategicPatternProfile = {
  primaryPattern: StrategicPatternName;
  secondaryPattern: StrategicPatternName;
  mechanism: string;
  rationale: string;
  dominantRisk: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ensureSentence(value: string): string {
  const text = normalize(value);
  if (!text) return "onvoldoende informatie beschikbaar.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function has(pattern: RegExp, text: string): boolean {
  return pattern.test(text);
}

function scorePattern(pattern: StrategicPatternName, source: string): number {
  switch (pattern) {
    case "contractorganisatie":
      return [
        /\bcontract|gemeent|gemeente|verzekeraar|budget|tarief|inkoop|plafond\b/i,
        /\bjeugdzorg|ggz|zorg\b/i,
        /\bconsortium|triage|toegang\b/i,
      ].filter((re) => re.test(source)).length;
    case "capaciteitsorganisatie":
      return [
        /\bpersoneel|talent|capaciteit|caseload|retentie|schaarste|zzp|teams\b/i,
        /\bkwaliteit|expertise|professionals\b/i,
      ].filter((re) => re.test(source)).length;
    case "platformorganisatie":
      return [
        /\bplatform|marktplaats|gebruikers|netwerkeffect|vraag en aanbod\b/i,
        /\bkritische massa|transactie|liquiditeit\b/i,
      ].filter((re) => re.test(source)).length;
    case "specialist":
      return [
        /\bniche|speciali|expertise|topkliniek|boutique|hoogwaardig\b/i,
        /\breputatie|prijs|onderscheid\b/i,
      ].filter((re) => re.test(source)).length;
    case "portfolio-organisatie":
      return [
        /\bportfolio|mix|productlijn|zorgvorm|holding|groep\b/i,
        /\brisicospreiding|versnippering|allocatie\b/i,
      ].filter((re) => re.test(source)).length;
    case "netwerkorganisatie":
      return [
        /\bconsortium|netwerk|partners|alliantie|franchise|samenwerking\b/i,
        /\bbereik|partnerschap|regionaal\b/i,
      ].filter((re) => re.test(source)).length;
    case "missieorganisatie":
      return [
        /\bmissie|impact|maatschappelijk|waarden|onderwijs|ngo|preventie\b/i,
        /\blegitimiteit|publiek|doel\b/i,
      ].filter((re) => re.test(source)).length;
  }
}

function buildMechanism(primary: StrategicPatternName, secondary: StrategicPatternName, source: string): string {
  if (primary === "contractorganisatie" && secondary === "capaciteitsorganisatie") {
    return "Contractlogica bepaalt budgetruimte, budgetruimte bepaalt capaciteit en capaciteit bepaalt hoeveel strategie uitvoerbaar blijft.";
  }
  if (primary === "netwerkorganisatie" && secondary === "contractorganisatie") {
    return "Partners en regionale toegang bepalen bereik, maar contractruimte bepaalt hoeveel van dat bereik financieel houdbaar is.";
  }
  if (primary === "platformorganisatie") {
    return "Netwerkvolume vergroot waarde, meer waarde trekt meer gebruikers en die lus bepaalt de strategische uitkomst.";
  }
  if (primary === "specialist") {
    return "Expertise bouwt reputatie, reputatie trekt vraag en vraag legitimeert prijs en positionering.";
  }
  if (primary === "portfolio-organisatie") {
    return "De mix van activiteiten bepaalt risicospreiding, focus en bestuurlijke complexiteit.";
  }
  if (primary === "missieorganisatie") {
    return "Impact creëert legitimiteit, legitimiteit trekt financiering en financiering houdt de missie uitvoerbaar.";
  }
  return normalize(source).includes("partner")
    ? "Samenwerking bepaalt capaciteit en bereik; bestuurlijke invloed bepaalt of dat netwerk strategisch werkt."
    : "Het primaire patroon bepaalt de strategische ruimte en het secundaire patroon bepaalt waar de uitvoering begrensd raakt.";
}

function buildRationale(primary: StrategicPatternName, secondary: StrategicPatternName): string {
  return ensureSentence(
    `Primair patroon is ${primary} en secundair patroon is ${secondary}, omdat financieringslogica en schaalmechanisme niet door één enkele interne factor worden bepaald`
  );
}

function buildDominantRisk(primary: StrategicPatternName, secondary: StrategicPatternName): string {
  if (primary === "contractorganisatie") {
    return "Verandering in contractlogica of budgetruimte verschuift direct de strategische speelruimte.";
  }
  if (primary === "capaciteitsorganisatie") {
    return "Verlies van schaars talent vertaalt zich direct naar minder capaciteit, lagere kwaliteit en lagere opbrengst.";
  }
  if (primary === "netwerkorganisatie") {
    return "Verlies van invloed in het netwerk verkleint bereik en bestuurlijke stuurkracht tegelijk.";
  }
  if (primary === "platformorganisatie") {
    return "Verlies van kritische massa ondermijnt de waardecreatie van het hele model.";
  }
  if (primary === "specialist") {
    return "Verouderde expertise of verlies van reputatie tast vraag en prijszetting direct aan.";
  }
  if (primary === "portfolio-organisatie") {
    return "Versnippering over te veel activiteiten verlaagt focus en bestuurlijke beheersbaarheid.";
  }
  return "Onduidelijke impact verzwakt legitimiteit en daarmee de ruimte voor financiering en continuiteit.";
}

export class StrategicPatternEngine {
  run(input: StrategicPatternEngineInput): StrategicPatternProfile {
    const source = normalize(
      [input.sector, input.dominantRisk, input.recommendedOption, ...(input.decisionOptions ?? []), input.sourceText]
        .filter(Boolean)
        .join(" ")
    );

    const ranked = ([
      "contractorganisatie",
      "capaciteitsorganisatie",
      "platformorganisatie",
      "specialist",
      "portfolio-organisatie",
      "netwerkorganisatie",
      "missieorganisatie",
    ] as StrategicPatternName[])
      .map((pattern) => ({ pattern, score: scorePattern(pattern, source) }))
      .sort((a, b) => b.score - a.score);

    const primaryPattern = ranked[0]?.pattern || "capaciteitsorganisatie";
    let secondaryPattern = ranked.find((item) => item.pattern !== primaryPattern && item.score > 0)?.pattern;

    if (!secondaryPattern) {
      secondaryPattern =
        primaryPattern === "contractorganisatie"
          ? "capaciteitsorganisatie"
          : primaryPattern === "capaciteitsorganisatie"
            ? "contractorganisatie"
            : primaryPattern === "netwerkorganisatie"
              ? "contractorganisatie"
              : "capaciteitsorganisatie";
    }

    return {
      primaryPattern,
      secondaryPattern,
      mechanism: ensureSentence(buildMechanism(primaryPattern, secondaryPattern, source)),
      rationale: buildRationale(primaryPattern, secondaryPattern),
      dominantRisk: buildDominantRisk(primaryPattern, secondaryPattern),
    };
  }
}
