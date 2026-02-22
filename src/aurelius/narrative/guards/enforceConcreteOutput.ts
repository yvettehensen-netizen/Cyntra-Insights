export const CONCRETE_REPROMPT_DIRECTIVE =
  "Schrijf concrete inhoud. Geen meta. Maak realistische bestuurlijke aanname als data ontbreekt.";

export const CYNTRA_SIGNATURE_LAYER_VIOLATION =
  "CYNTRA SIGNATURE LAYER VIOLATIE";
const MAX_CONCRETE_REPROMPT_ATTEMPTS = 2;

const FORBIDDEN_PATTERNS = [
  /\bmoet\b/i,
  /moet expliciet worden/i,
  /\bformuleer\b/i,
  /\banalyseer\b/i,
  /geen expliciete context/i,
  /ontbreekt/i,
  /placeholder/i,
  /trade-?offs\s+moeten/i,
  /nog niet voldoende/i,
  /zou kunnen/i,
  /lijkt erop dat/i,
];

const WEAK_SIGNAL_PATTERNS = [
  /moet expliciet worden/i,
  /trade-?offs?\s+moeten/i,
  /nog niet voldoende/i,
  /zou kunnen/i,
  /lijkt erop dat/i,
];

const DEFAULT_ASSUMPTIONS: Record<string, string> = {
  dominantThesis:
    "Aanname: de bestuursraad kiest binnen 14 dagen een enkele strategische lijn en sluit concurrerende initiatieven.",
  coreConflict:
    "Aanname: schaal vergroot markttempo en verlaagt lokale autonomie; stabilisatie vergroot bestuurbaarheid en verlaagt groeisnelheid.",
  tradeoffs:
    "Aanname: gekozen focus levert snelheid op, geaccepteerd verlies is afbouw van niet-kritieke programma's en reductie van mandaat op middenniveau.",
  opportunityCost:
    "Aanname 30 dagen: doorlooptijd stijgt en prioriteiten vervagen. Aanname 90 dagen: marge lekt door herwerk en besluitvertraging. Aanname 365 dagen: strategische vrijheid krimpt en herstelkosten nemen structureel toe.",
  governanceImpact:
    "Aanname: besluitrechten worden tijdelijk gecentreerd bij het bestuurlijk kernteam, escalaties verlopen binnen 48 uur en eigenaarschap is eenduidig per prioriteit.",
  powerDynamics:
    "Aanname: informele invloed verschuift van netwerkcoalities naar formeel mandaat; verwacht gedrag is scope-rek, vertraagde escalatie en stille herprioritering.",
  executionRisk:
    "Aanname: grootste faalpunt is parallelle prioritering; blocker is dubbel mandaat; onderstroom bestaat uit loyaliteitsgedreven vertraging in middenmanagement.",
  interventionPlan90D:
    "Week 1-2: bestuurlijke keuze en mandaat publiceren. Week 3-6: budget, capaciteit en besluitrechten herschikken. Week 7-12: executie meten op snelheid, marge en leverbetrouwbaarheid.",
  decisionContract:
    "De Raad van Bestuur committeert zich aan: een enkel besluit, meetbaar resultaat binnen 90 dagen, besluitvenster van 14 dagen en expliciete acceptatie van verlies aan niet-prioritaire activiteiten.",
  narrative:
    "Aanname: de top kiest een dominante lijn met meetbaar executiedoel, expliciet verlies en strak tijdvenster, zodat bestuurlijke spanning wordt omgezet naar uitvoeringsdiscipline.",
};

function sanitizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function hasForbiddenConcretePattern(text: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text));
}

function concreteWeaknessScore(text: string): number {
  const source = sanitizeWhitespace(String(text || ""));
  if (!source) return 4;

  let score = hasForbiddenConcretePattern(source) ? 2 : 0;
  for (const pattern of WEAK_SIGNAL_PATTERNS) {
    if (pattern.test(source)) score += 1;
  }
  return score;
}

function sectionKeyFromHeading(heading: string): string {
  const normalized = heading
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.includes("dominante") && normalized.includes("these")) {
    return "dominantThesis";
  }
  if (normalized.includes("kernconflict")) return "coreConflict";
  if (normalized.includes("trade")) return "tradeoffs";
  if (normalized.includes("opportunity")) return "opportunityCost";
  if (normalized.includes("governance")) return "governanceImpact";
  if (normalized.includes("machtsdynamiek") || normalized.includes("onderstroom")) {
    return "powerDynamics";
  }
  if (normalized.includes("executierisico")) return "executionRisk";
  if (normalized.includes("90") || normalized.includes("interventieplan")) {
    return "interventionPlan90D";
  }
  if (normalized.includes("decision contract")) return "decisionContract";

  return "narrative";
}

function concreteFallback(sectionKey: string, contextHint?: string): string {
  const fallback = DEFAULT_ASSUMPTIONS[sectionKey] || DEFAULT_ASSUMPTIONS.narrative;
  const context = sanitizeWhitespace(contextHint || "");
  if (!context) return fallback;

  const safeContext = context
    .replace(/\bmoet\b/gi, "kiest")
    .replace(/\bformuleer\b/gi, "beschrijf concreet")
    .replace(/\banalyseer\b/gi, "duid")
    .replace(/geen expliciete context/gi, "beperkte context")
    .replace(/ontbreekt/gi, "nog niet beschikbaar")
    .replace(/placeholder/gi, "voorbeeldwaarde")
    .replace(/trade-?offs?\s+moeten/gi, "trade-offs zijn");

  if (hasForbiddenConcretePattern(safeContext)) {
    return fallback;
  }

  return `${fallback} Aannamecontext: ${safeContext.slice(0, 240)}.`;
}

function concreteRepromptFallback(
  sectionKey: string,
  contextHint?: string,
  attempt = 1
): string {
  const fallback = sanitizeWhitespace(concreteFallback(sectionKey, contextHint));
  const assumption = /^aanname/i.test(fallback) ? fallback : `Aanname: ${fallback}`;
  const boundedAttempt = Math.max(1, Math.min(attempt, MAX_CONCRETE_REPROMPT_ATTEMPTS));
  return sanitizeWhitespace(
    `Expliciete aanname (herprompt ${boundedAttempt}/${MAX_CONCRETE_REPROMPT_ATTEMPTS}): ${assumption} ${CONCRETE_REPROMPT_DIRECTIVE}`
  );
}

export function enforceConcreteString(
  input: string,
  sectionKey: string,
  contextHint?: string
): string {
  const value = sanitizeWhitespace(String(input || ""));
  let candidate = value;

  for (let attempt = 1; attempt <= MAX_CONCRETE_REPROMPT_ATTEMPTS; attempt++) {
    if (candidate && concreteWeaknessScore(candidate) === 0) {
      break;
    }
    candidate = concreteRepromptFallback(sectionKey, contextHint, attempt);
  }

  if (concreteWeaknessScore(candidate) > 0) {
    candidate = concreteRepromptFallback(
      sectionKey,
      contextHint,
      MAX_CONCRETE_REPROMPT_ATTEMPTS
    );
  }

  if (hasForbiddenConcretePattern(candidate) || concreteWeaknessScore(candidate) > 0) {
    throw new Error(CYNTRA_SIGNATURE_LAYER_VIOLATION);
  }

  return candidate;
}

export function enforceConcreteOutputMap<T extends Record<string, string>>(
  input: T,
  options?: { contextHint?: string }
): T {
  let output: Record<string, string> = {};

  for (let attempt = 0; attempt <= MAX_CONCRETE_REPROMPT_ATTEMPTS; attempt++) {
    output = {};

    for (const [key, value] of Object.entries(input)) {
      output[key] = enforceConcreteString(value, key, options?.contextHint);
    }

    const residual = Object.values(output).find(
      (value) => concreteWeaknessScore(value) > 0
    );
    if (!residual) {
      return output as T;
    }
  }

  const hardened: Record<string, string> = {};
  for (const key of Object.keys(input)) {
    hardened[key] = concreteRepromptFallback(
      key,
      options?.contextHint,
      MAX_CONCRETE_REPROMPT_ATTEMPTS
    );
  }

  return hardened as T;
}

export function enforceConcreteNarrativeMarkdown(
  markdown: string,
  contextHint?: string
): string {
  const text = String(markdown || "").trim();
  if (!text) {
    throw new Error(CYNTRA_SIGNATURE_LAYER_VIOLATION);
  }

  if (!text.includes("###")) {
    return enforceConcreteString(text, "narrative", contextHint);
  }

  const sections = text
    .split(/(?=###\s*\d+\.)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const rewritten = sections.map((section) => {
    const [headingLine, ...bodyLines] = section.split("\n");
    const heading = headingLine.trim();
    const body = bodyLines.join("\n").trim();
    const sectionKey = sectionKeyFromHeading(heading);
    const concreteBody = enforceConcreteString(body, sectionKey, contextHint);
    return `${heading}\n${concreteBody}`.trim();
  });

  const merged = rewritten.join("\n\n").trim();
  if (hasForbiddenConcretePattern(merged) || concreteWeaknessScore(merged) > 0) {
    throw new Error(CYNTRA_SIGNATURE_LAYER_VIOLATION);
  }

  return merged;
}
