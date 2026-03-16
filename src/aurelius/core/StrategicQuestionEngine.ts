export type StrategicQuestionEngineInput = {
  organisation?: string;
  sector?: string;
  strategy?: string;
  dominantRisk?: string;
  decisionOptions?: string[];
  sourceText?: string;
};

export type StrategicQuestionSet = {
  raisonDetre: string;
  powerStructure: string;
  bottleneck: string;
  failurePoint: string;
  boardDecision: string;
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

function deriveYouthQuestions(input: StrategicQuestionEngineInput, source: string): StrategicQuestionSet {
  const options = input.decisionOptions ?? [];
  return {
    raisonDetre: ensureSentence(
      "De organisatie ontleent haar bestaansrecht aan brede ambulante expertise, maatwerk per gezin en regionale samenwerking rond complexe jeugdcasuistiek"
    ),
    powerStructure: ensureSentence(
      "De machtsstructuur loopt primair via gemeente naar consortium naar zorgorganisatie: gemeenten bepalen budget en contractruimte, het consortium beïnvloedt instroom en triage, de organisatie bepaalt de uitvoering"
    ),
    bottleneck: ensureSentence(
      has(/\bcontract|budget\b/i, source)
        ? "Het schaarsepunt ligt in teamcapaciteit binnen gemeentelijke contractruimte en budgetgedreven caseload"
        : "Het schaarsepunt ligt in uitvoerbare capaciteit binnen externe instroom- en budgetgrenzen"
    ),
    failurePoint: ensureSentence(
      has(/\bspecialisatie|niche\b/i, source)
        ? "De strategie breekt wanneer gemeenten en regionale toegang sterker op niche-aanbieders en scherpere specialisatie gaan sturen dan op brede ambulante aanbieders"
        : "De strategie breekt wanneer externe contractlogica minder ruimte laat voor brede ambulante uitvoering dan voor specialistische of goedkopere routes"
    ),
    boardDecision: ensureSentence(
      `Het bestuur moet kiezen of ${normalize(input.organisation || "de organisatie")} brede ambulante expertise actief beschermt via contract- en consortiumsturing, of het portfolio selectiever versmalt richting specialisatie`
    ),
  };
}

function deriveGenericQuestions(input: StrategicQuestionEngineInput, source: string): StrategicQuestionSet {
  const optionA = normalize(input.decisionOptions?.[0] || input.strategy || "de huidige strategie");
  const optionB = normalize(input.decisionOptions?.[1] || "een alternatief strategisch pad");
  return {
    raisonDetre: ensureSentence(
      `De organisatie verdient haar bestaansrecht doordat zij waarde levert die niet eenvoudig vervangbaar is binnen ${normalize(input.sector || "haar markt")}`
    ),
    powerStructure: ensureSentence(
      has(/\boverheid|gemeente|toezicht|contract\b/i, source)
        ? "Externe financiers, contractpartijen en toezichthouders bepalen in hoge mate welke strategische ruimte werkelijk beschikbaar is"
        : "Succes wordt bepaald door de actor die instroom, prijslogica of toegang tot schaarse middelen controleert"
    ),
    bottleneck: ensureSentence(
      has(/\btalent|personeel|arbeidsmarkt\b/i, source)
        ? "De primaire bottleneck ligt in talent en uitvoerbare capaciteit"
        : has(/\bkapitaal|cash|burn\b/i, source)
          ? "De primaire bottleneck ligt in kapitaal en financieringsruimte"
          : "De primaire bottleneck ligt in het schaarsepunt dat groei of herstel bestuurlijk begrenst"
    ),
    failurePoint: ensureSentence(
      `De strategie faalt zodra ${optionA.toLowerCase()} niet langer bestand is tegen externe systeemdruk of sneller waarde verliest dan ${optionB.toLowerCase()}`
    ),
    boardDecision: ensureSentence(
      `Het bestuur moet beslissen tussen ${optionA} en ${optionB}, en expliciet maken welke randvoorwaarden morgen bestuurlijk worden afgedwongen`
    ),
  };
}

export class StrategicQuestionEngine {
  run(input: StrategicQuestionEngineInput): StrategicQuestionSet {
    const source = normalize(
      [
        input.organisation,
        input.sector,
        input.strategy,
        input.dominantRisk,
        ...(input.decisionOptions ?? []),
        input.sourceText,
      ].filter(Boolean).join(" ")
    );

    if (has(/\b(jeugdzorg|ambulant|consortium|triage|gemeent|contract|budget)\b/i, source)) {
      return deriveYouthQuestions(input, source);
    }

    return deriveGenericQuestions(input, source);
  }
}
