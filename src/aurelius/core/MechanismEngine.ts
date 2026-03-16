export type MechanismEngineInput = {
  strategy?: string;
  dominantRisk?: string;
  sourceText?: string;
  externalPressure?: string;
};

export type MechanismEngineOutput = {
  symptom: string;
  cause: string;
  mechanism: string;
  consequence: string;
  systemPressure: string;
  boardImplication: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function has(pattern: RegExp, text: string): boolean {
  return pattern.test(text);
}

function ensureSentence(value: string): string {
  const text = normalize(value);
  if (!text) return "onvoldoende informatie beschikbaar.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function deriveYouthMechanism(source: string, risk: string, strategy: string): MechanismEngineOutput {
  const symptom =
    risk || "Wachtdruk, contractspanning en capaciteitsdruk lopen tegelijk op in de ambulante jeugdzorg";
  const cause = has(/\bconsortium|triage|toegang\b/i, source)
    ? "Instroom en toewijzing worden mede buiten de eigen organisatie bepaald via consortium en regionale triage"
    : "Instroom en capaciteit bewegen niet volledig op hetzelfde bestuurlijke ritme";
  const mechanism = has(/\bgemeent|contract|budget\b/i, source)
    ? "Een breed ambulant model moet functioneren binnen gemeentelijke contractruimte, regionale triage en budgetgedreven capaciteit"
    : "De strategie moet tegelijk kwaliteit, bereik en uitvoerbaarheid dragen binnen externe contract- en budgetkaders";
  const consequence = has(/\bspecialisatie|niche\b/i, `${source} ${strategy}`)
    ? "Breedte wordt kwetsbaar zodra externe partijen specialisatie en scherpere financieringslogica belonen"
    : "Verbreding vergroot sneller de bestuurlijke druk dan extra activiteit die spanning kan compenseren";
  const systemPressure = [
    has(/\bgemeent|contract|budget\b/i, source) ? "gemeentelijke contractlogica" : "",
    has(/\bconsortium|triage|toegang\b/i, source) ? "consortiumtriage" : "",
    has(/\bzzp|personeel|arbeidsmarkt|schaarste|werkdruk\b/i, source) ? "personeelsschaarste" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    symptom: ensureSentence(symptom),
    cause: ensureSentence(cause),
    mechanism: ensureSentence(mechanism),
    consequence: ensureSentence(consequence),
    systemPressure: ensureSentence(systemPressure || "externe systeemdruk op instroom, capaciteit en contractdiscipline"),
    boardImplication: ensureSentence(
      `Bestuur moet ${normalize(strategy).toLowerCase() || "de gekozen richting"} alleen voortzetten als instroomlogica, contractruimte en kerncapaciteit bestuurlijk verdedigbaar blijven`
    ),
  };
}

function deriveGenericMechanism(source: string, risk: string, strategy: string): MechanismEngineOutput {
  return {
    symptom: ensureSentence(risk || "Operationele druk en strategische versnippering lopen op"),
    cause: ensureSentence(
      "Externe druk, interne uitvoerbaarheid en bestuurlijke prioritering grijpen niet vanzelf in elkaar"
    ),
    mechanism: ensureSentence(
      `De strategie ${normalize(strategy).toLowerCase() || "van de organisatie"} werkt alleen als capaciteit, sturing en marktdruk in hetzelfde ritme worden bestuurd`
    ),
    consequence: ensureSentence(
      "Zonder mechanische koppeling tussen keuze, capaciteit en correctie stapelen symptomen zich sneller op dan herstelmaatregelen"
    ),
    systemPressure: ensureSentence(
      normalize(source).slice(0, 220) || "externe marktdruk, capaciteitsdruk en bestuurlijke fragmentatie"
    ),
    boardImplication: ensureSentence(
      "Bestuur moet expliciet maken welk mechanisme de strategie draagt en bij welke systeemdruk herbesluit verplicht is"
    ),
  };
}

export class MechanismEngine {
  run(input: MechanismEngineInput): MechanismEngineOutput {
    const source = normalize(
      [input.sourceText, input.dominantRisk, input.strategy, input.externalPressure].filter(Boolean).join(" ")
    );
    const risk = normalize(input.dominantRisk || "");
    const strategy = normalize(input.strategy || "");

    if (has(/\b(jeugdzorg|ambulant|ambulante|consortium|triage|gemeent|contract|budget)\b/i, source)) {
      return deriveYouthMechanism(source, risk, strategy);
    }

    return deriveGenericMechanism(source, risk, strategy);
  }
}
