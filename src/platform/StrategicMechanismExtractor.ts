import { normalize } from "./storage";

export type CaseClassification = "CRISIS" | "STABLE" | "SUCCESS_MODEL" | "TRANSFORMATION";

export type StrategicMechanismOutput = {
  successMechanism: string;
  riskMechanism: string;
  scaleMechanism: string;
  confidence: number;
};

type InputInsights = {
  facts: string[];
  actions: string[];
};

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((rx) => rx.test(text));
}

export function extractStrategicMechanisms(
  rawInput: string,
  insights: InputInsights,
  classification: CaseClassification
): StrategicMechanismOutput {
  const text = normalize(rawInput).toLowerCase();
  const factText = insights.facts.join(" ").toLowerCase();
  const successSignals =
    Number(hasAny(text, [/(aandelen|mede-eigenaar|aandeelhouder|eigenaarschap)/])) +
    Number(hasAny(text, [/(open sollicitaties|lage uitstroom|minimaal verloop|laag verloop)/])) +
    Number(hasAny(text, [/(laag ziekteverzuim|2[,.]3% ziekteverzuim)/])) +
    Number(hasAny(text, [/(geen middenmanagement|zonder middenmanagement|platte organisatie|korte lijntjes|korte lijnen)/])) +
    Number(hasAny(text, [/(maximaal 5 fte|niet harder dan 5 fte)/])) +
    Number(hasAny(text, [/(netwerkorganisatie|maatschappelijke impact)/]));

  if (classification === "SUCCESS_MODEL" || successSignals >= 3) {
    const successMechanism = hasAny(text, [/(aandelen|mede-eigenaar|aandeelhouder|eigenaarschap)/])
      ? "Medewerkersparticipatie via aandelen vergroot psychologisch en financieel eigenaarschap, waardoor betrokkenheid en retentie hoog blijven."
      : "Sterke autonomie en korte lijnen verhogen eigenaarschap in teams, waardoor kwaliteit en continuiteit structureel verbeteren.";

    const riskMechanism = hasAny(text, [/(maximaal 5 fte|niet harder dan 5 fte|groei)/])
      ? "Snelle volumegroei dwingt extra coördinatielagen af, waardoor autonomie en eigenaarschap afnemen en het succesmodel kan eroderen."
      : "Opschaling zonder governance-guardrails vergroot bureaucratie, waardoor het huidige prestatiemechanisme verzwakt.";

    const scaleMechanism = hasAny(text, [/(netwerkorganisatie|maatschappelijke impact)/])
      ? "Impact schaalt via netwerk- en partnermodellen zonder proportionele interne volumegroei, mits governance en kwaliteitsstandaarden expliciet zijn."
      : "Schaal werkt alleen via replicatie in kleine autonome cellen met behoud van eigenaarschapsprikkels en duidelijke kwaliteitsnormen.";

    return { successMechanism, riskMechanism, scaleMechanism, confidence: 0.86 };
  }

  if (classification === "CRISIS" || hasAny(factText, [/(margedruk|niet kostendekkend|contractpositie|declaratieplafonds)/])) {
    return {
      successMechanism:
        "Operationele inzet houdt de organisatie draaiend, maar de huidige besturing compenseert structurele financiële druk onvoldoende.",
      riskMechanism:
        "Kostenstijging en opbrengstbeperkingen versterken elkaar, waardoor besluitvertraging direct doorwerkt in marges en uitvoerbaarheid.",
      scaleMechanism:
        "Groei zonder contract- en kostprijsdiscipline vergroot verlieslatende volumes sneller dan de organisatorische draagkracht.",
      confidence: 0.74,
    };
  }

  return {
    successMechanism:
      "Het huidige model werkt door consistente uitvoering en lokale eigenaarschapspatronen in de operatie.",
    riskMechanism:
      "Onduidelijke prioritering onder druk kan besluitkwaliteit verlagen en verborgen frictie vergroten.",
    scaleMechanism:
      "Schaal vraagt expliciete governance-keuzes, anders neemt complexiteit sneller toe dan leervermogen.",
    confidence: 0.68,
  };
}
