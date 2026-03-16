export type BoardroomRedFlagCategory =
  | "groei zonder mechanisme"
  | "strategie zonder macht"
  | "complexiteitsexplosie"
  | "afhankelijkheid buiten organisatie"
  | "strategie zonder stopregel"
  | "kpi's zonder strategische betekenis"
  | "innovatie zonder capaciteit"
  | "strategie gebaseerd op aannames";

export type BoardroomRedFlag = {
  category: BoardroomRedFlagCategory;
  description: string;
  mechanism: string;
  boardQuestion: string;
};

export type BoardroomRedFlagEngineInput = {
  sector?: string;
  dominantRisk?: string;
  sourceText?: string;
  recommendedOption?: string;
  decisionOptions?: string[];
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

function pushFlag(
  flags: BoardroomRedFlag[],
  category: BoardroomRedFlagCategory,
  description: string,
  mechanism: string,
  boardQuestion: string
): void {
  if (flags.some((item) => item.category === category)) return;
  flags.push({
    category,
    description: ensureSentence(description),
    mechanism: ensureSentence(mechanism),
    boardQuestion: ensureSentence(boardQuestion),
  });
}

export class BoardroomRedFlagEngine {
  run(input: BoardroomRedFlagEngineInput): BoardroomRedFlag[] {
    const source = normalize(
      [input.sector, input.dominantRisk, input.recommendedOption, ...(input.decisionOptions ?? []), input.sourceText]
        .filter(Boolean)
        .join(" ")
    );
    const flags: BoardroomRedFlag[] = [];

    if (has(/\bgroei|verbreding|opschalen|uitbreiding\b/i, source) && !has(/\bmechanisme|capaciteit|contract|partner|netwerk\b/i, source)) {
      pushFlag(
        flags,
        "groei zonder mechanisme",
        "De organisatie spreekt over groei of verbreding zonder hard schaalmechanisme.",
        "Groeiambitie zonder expliciete koppeling aan contractruimte, capaciteit of netwerklogica blijft bestuurlijk wensdenken.",
        "Welk mechanisme laat deze strategie daadwerkelijk groeien zonder de kernoperatie te overbelasten?"
      );
    }

    if (has(/\bgemeent|consortium|verzekeraar|contract|triage|toegang\b/i, source)) {
      pushFlag(
        flags,
        "strategie zonder macht",
        "De strategie veronderstelt ruimte die feitelijk door externe partijen wordt begrensd.",
        "Instroom, contractvolume of budgetruimte worden mede buiten de eigen organisatie bepaald.",
        "Welke strategische keuze blijft over als de organisatie zelf de instroom- of contractlogica niet controleert?"
      );
    }

    if (has(/\bbreed|verbreding|portfolio|pilot|project|innovatie|meer diensten\b/i, source) && has(/\bcapaciteit|team|werkdruk|personeel|caseload\b/i, source)) {
      pushFlag(
        flags,
        "complexiteitsexplosie",
        "De organisatie voegt strategische complexiteit sneller toe dan capaciteit kan absorberen.",
        "Meer diensten, initiatieven of positioneringen vergroten bestuurlijke en operationele druk zonder proportionele capaciteitsgroei.",
        "Welke activiteiten worden expliciet gestopt als de organisatie breedte wil behouden?"
      );
    }

    if (has(/\bconsortium|gemeent|partner|alliantie|toegang\b/i, source)) {
      pushFlag(
        flags,
        "afhankelijkheid buiten organisatie",
        "Kritische sturing ligt buiten de eigen organisatie.",
        "Externe partijen beïnvloeden toegang, budget of bereik sterker dan interne planning alleen kan corrigeren.",
        "Hoe beschermt het bestuur de strategie als consortium, gemeente of partnerlogica verandert?"
      );
    }

    pushFlag(
      flags,
      "strategie zonder stopregel",
      "De strategie bevat gemakkelijk meer ambitie dan expliciete exitcriteria.",
      "Zonder stopregels blijven verbreding, innovatie of prioriteiten vaak doorlopen ondanks tegenvallende uitvoerbaarheid.",
      "Bij welke KPI-, marge- of capaciteitsgrens moet het bestuur de gekozen richting direct heroverwegen?"
    );

    if (has(/\bkpi|dashboard|wachttijd|cliënten|volume|activiteit\b/i, source) || !has(/\bmarge|rendabiliteit|contractmix|caseload\b/i, source)) {
      pushFlag(
        flags,
        "kpi's zonder strategische betekenis",
        "Er is risico dat de organisatie vooral meet wat zichtbaar is en niet wat strategisch bepalend is.",
        "Activiteits-KPI's zeggen weinig als ze niet gekoppeld zijn aan marge, contractkwaliteit, caseload of portfolio-effect.",
        "Welke drie KPI's voorspellen daadwerkelijk of de strategie bestuurlijk werkt?"
      );
    }

    if (has(/\binnovatie|pilot|experiment|nieuwe methodiek|nieuw project\b/i, source) && has(/\bteam|capaciteit|werkdruk|personeel\b/i, source)) {
      pushFlag(
        flags,
        "innovatie zonder capaciteit",
        "Nieuwe initiatieven kunnen sneller starten dan de organisatie ze uitvoerbaar kan dragen.",
        "Innovatie trekt aandacht, tijd en specialistische capaciteit weg uit de kernoperatie.",
        "Welke innovatie wordt gepauzeerd als de kerncapaciteit onder druk komt?"
      );
    }

    if (has(/\bzal wel|hopelijk|verwacht|waarschijnlijk|vast|aanname|onderstelt\b/i, source) || !has(/\bbewijs|aantoonbaar|meetbaar|norm\b/i, source)) {
      pushFlag(
        flags,
        "strategie gebaseerd op aannames",
        "De strategie lijkt deels te rusten op verwachtingen die nog niet hard zijn gevalideerd.",
        "Aannames over steun van financiers, partners of marktgedrag kunnen de bestuurlijke logica vertekenen.",
        "Welke kernveronderstelling moet eerst bewezen worden voordat deze strategie verder wordt uitgebreid?"
      );
    }

    while (flags.length < 3) {
      pushFlag(
        flags,
        flags.length === 0 ? "strategie zonder stopregel" : flags.length === 1 ? "kpi's zonder strategische betekenis" : "strategie gebaseerd op aannames",
        "De bestuurlijke logica vraagt explicietere toetsing voordat de strategie verder wordt uitgebouwd.",
        "Zonder harde criteria blijft optimisme sterker dan corrigeerbare executielogica.",
        "Welke bestuurlijke grens maakt deze strategie morgen toetsbaar?"
      );
    }

    return flags.slice(0, 8);
  }
}
