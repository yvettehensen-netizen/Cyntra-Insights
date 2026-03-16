import type { StrategicFailurePoint } from "@/aurelius/analysis/StrategicAnalysisMap";

export type StrategicFailureEngineInput = {
  strategy?: string;
  options?: string[];
  dominantRisk?: string;
  sourceText?: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function has(pattern: RegExp, text: string): boolean {
  return pattern.test(text);
}

function extractMechanisms(strategy: string, source: string): string[] {
  if (has(/\bbrede ambulante specialist|ambulante\b/i, `${strategy} ${source}`)) {
    return [
      "Breed zorgaanbod en maatwerk als kern van de positionering",
      "Regionale samenwerking als toegangspoort tot instroom",
      "Capaciteitsflexibiliteit via mix van vast en flexibel personeel",
    ];
  }
  return [
    "Huidige strategie steunt op samenhang tussen propositie, capaciteit en sturing",
    "Uitvoerbaarheid vraagt expliciete keuzevolgorde",
    "Governance bepaalt of spanning corrigeerbaar blijft",
  ];
}

function extractDependencies(source: string): string[] {
  const dependencies: string[] = [];
  if (has(/\bgemeent|jeugdwet|contract/i, source)) dependencies.push("Gemeentelijke contractlogica en budgetstructuur");
  if (has(/\bconsortium|triage|toegang/i, source)) dependencies.push("Consortiumtriage en regionale toegang");
  if (has(/\bpersoneel|schaarste|zzp|werkdruk/i, source)) dependencies.push("Personeelsschaarste en capaciteitsdruk");
  if (has(/\bbudget|tarief|marge|kostprijs/i, source)) dependencies.push("Budgetdruk en beperkte financieringslogica");
  return Array.from(new Set(dependencies));
}

function buildFailurePoint(mechanism: string, dependency: string): StrategicFailurePoint {
  if (/Gemeentelijke contractlogica/i.test(dependency)) {
    return {
      mechanism,
      systemPressure: dependency,
      risk: "Brede aanbieders verliezen economische ruimte wanneer contractering specialisatie of lagere kosten bevoordeelt.",
      boardTest: "Wat gebeurt er als gemeenten binnen drie jaar vooral specialistische aanbieders contracteren?",
    };
  }
  if (/Consortiumtriage/i.test(dependency)) {
    return {
      mechanism,
      systemPressure: dependency,
      risk: "De organisatie verliest stuurkracht als instroom, matching en wachtdruk vooral buiten de eigen governance worden bepaald.",
      boardTest: "Wat gebeurt er als consortiumtriage structureel casuistiek toewijst die wel complexer maar niet rendabeler is?",
    };
  }
  if (/Personeelsschaarste/i.test(dependency)) {
    return {
      mechanism,
      systemPressure: dependency,
      risk: "Breedte wordt bestuurlijk onhoudbaar wanneer capaciteitsdruk sneller stijgt dan teams specialistische continuiteit kunnen borgen.",
      boardTest: "Wat gebeurt er als retentie daalt terwijl gemeenten wel op volume en bereik blijven drukken?",
    };
  }
  return {
    mechanism,
    systemPressure: dependency,
    risk: "De gekozen strategie breekt wanneer externe druk harder toeneemt dan bestuurlijke correctie kan compenseren.",
    boardTest: "Welke bestuurlijke keuze wordt onvermijdelijk als deze afhankelijkheid binnen twaalf maanden verslechtert?",
  };
}

export class StrategicFailureEngine {
  run(input: StrategicFailureEngineInput): StrategicFailurePoint[] {
    const source = `${input.sourceText || ""}\n${input.dominantRisk || ""}\n${(input.options || []).join("\n")}`;
    const strategy = normalize(input.strategy || input.options?.[0] || "");
    const mechanisms = extractMechanisms(strategy, source);
    const dependencies = extractDependencies(source);

    const points = dependencies.map((dependency, index) =>
      buildFailurePoint(mechanisms[index % mechanisms.length] || strategy || "Strategisch kernmechanisme", dependency)
    );

    const padded = [...points];
    while (padded.length < 3) {
      padded.push(
        buildFailurePoint(
          mechanisms[padded.length % mechanisms.length] || "Strategisch kernmechanisme",
          dependencies[padded.length % dependencies.length] || "Externe systeemdruk"
        )
      );
    }

    return padded.slice(0, 5);
  }
}
