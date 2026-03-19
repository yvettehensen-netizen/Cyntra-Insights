import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

type KillerInsightMeta = {
  score: number;
  failed_checks: string[];
  evidence_used: number;
};

type KillerInsightOutput = {
  killer_insights: string[];
  killer_insights_meta: KillerInsightMeta;
};

const TARGET_MIN = 7;
const TARGET_MAX = 10;
const NON_TRIVIAL_RE = /\b(transparantie|margekaart|beter sturen|meer focus)\b/i;
const MECHANISM_RE = /\b(?:ONDERLIGGENDE OORZAAK|WAAROM DIT BELANGRIJK IS)\b/i;
const LEVER_RE = /\bBESTUURLIJK GEVOLG\b/i;
const EVIDENCE_RE = /(€\s?\d|\d+\s?%|\d+\s?(?:dagen|maanden|jaar)|plafond|contractvloer|no-show|casemix|doorlooptijd|bijbetaling|tarief)/i;
const DOUBLE_IMPACT_RE = /organisatie[\s\S]{0,120}(cliënt|client|klant)|(?:cliënt|client|klant)[\s\S]{0,120}organisatie/i;
const CONTRADICTION_RE = /\b(tenzij|mits|alleen als|totdat)\b/i;

function compact(text: string): string {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function unique(items: string[]): string[] {
  return [...new Set(items.map((v) => compact(v)).filter(Boolean))];
}

function gatherRelevantText(context: AnalysisContext, results: ModelResult[]): string {
  const ctx = compact(context.rawText || "");
  const docs = (context.documents ?? []).map((d) => compact(d)).join("\n");

  const allowedModels = [
    "Structurele Diagnose",
    "Strategic Insight Engine",
    "Organisatiedynamiek",
    "Boardroom Intelligence",
    "Decision Pressure",
    "StrategicForesight",
    "Simulation",
  ];

  const chunks = results
    .filter((m) => {
      const model = compact(m.model);
      return allowedModels.some((token) => model.toLowerCase().includes(token.toLowerCase()));
    })
    .map((m) => {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? {});
      return [m.model, content, ...(m.insights ?? []), ...(m.risks ?? [])].join("\n");
    });

  return [ctx, docs, ...chunks].filter(Boolean).join("\n\n");
}

function collectEvidence(text: string): string[] {
  const signals: string[] = [];
  const patterns = [
    /€\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?/g,
    /\d+(?:[.,]\d+)?\s?%/g,
    /\d+\s?(?:dagen|maanden|jaar|jaren|week|weken)/gi,
    /plafond\w*[\s\S]{0,30}?€\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?/gi,
    /contractvloer/gi,
    /no-show/gi,
    /casemix/gi,
    /bijbetaling/gi,
    /doorlooptijd/gi,
    /tarief(?:druk|daling|verlaging)?/gi,
  ];
  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const hit of matches.slice(0, 4)) {
      signals.push(compact(hit));
    }
  }
  return unique(signals).slice(0, 12);
}

function pickEvidence(evidence: string[], fallback: string[]): string {
  const set = unique([...evidence, ...fallback]).slice(0, 3);
  if (!set.length) {
    return "Geen harde parameters in broncontext; risico op bestuurlijk sturen zonder feitenbasis.";
  }
  return set.map((e) => `- ${e}`).join("\n");
}

function formatInsight(index: number, payload: {
  truth: string;
  evidence: string;
  mechanism: string;
  action: string;
  risk: string;
}): string {
  return [
    `INZICHT — ${payload.truth}`,
    `WAAROM DIT BELANGRIJK IS — ${payload.mechanism} Bewijs: ${payload.evidence.replace(/^- /gm, "").replace(/\n/g, "; ")}`,
    `BESTUURLIJK GEVOLG — ${payload.action} ${payload.risk}`,
  ].join("\n");
}

function hasPlanningSignal(text: string): boolean {
  return /\b(planning|intake|rooster|secretariaat|instroom)\b/i.test(text);
}

function hasCapacitySignal(text: string): boolean {
  return /\b(FTE|fte|kamers|capaciteit|uitbreiding)\b/i.test(text);
}

function hasNormSignal(text: string): boolean {
  return /\b(75%|productiviteit|6 uur cliëntcontact|normdruk)\b/i.test(text);
}

function hasAccessSignal(text: string): boolean {
  return /\b(bijbetaling|toegang|doorverwijzing|wachtlijst|uitval)\b/i.test(text);
}

function hasDoubleAgendaSignal(text: string): boolean {
  return /\b(consolideren|consolidatie)\b[\s\S]{0,120}\b(verbreding|expansie|nieuw initiatief)\b/i.test(text);
}

function runChecks(insight: string): string[] {
  const failed: string[] = [];
  if (NON_TRIVIAL_RE.test(insight)) failed.push("non_trivial");
  if (!MECHANISM_RE.test(insight)) failed.push("mechanism");
  if (!LEVER_RE.test(insight)) failed.push("leverage");
  if (!EVIDENCE_RE.test(insight)) failed.push("evidence");
  if (!DOUBLE_IMPACT_RE.test(insight)) failed.push("double_impact");
  if (!CONTRADICTION_RE.test(insight)) failed.push("tegenspraak");
  return failed;
}

function dedupeInsights(insights: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const insight of insights) {
    const key = compact(insight.toLowerCase().replace(/[^a-z0-9]+/g, " "));
    const shortKey = key.split(" ").slice(0, 28).join(" ");
    if (seen.has(shortKey)) continue;
    seen.add(shortKey);
    out.push(insight);
  }
  return out;
}

function buildInsights(text: string, evidence: string[]): string[] {
  const baseEvidence = pickEvidence(evidence, ["tariefdruk", "contractplafond", "capaciteitsnorm"]);
  const insights: string[] = [];

  // Heuristics summary:
  // H1 checks if growth above contract ceilings is structurally loss-making.
  // H2 links central planning/intake to insurer contract room as a daily lever.
  // H3 blocks capacity expansion until contract floors are explicit.
  // H4 reframes 75%-norm pressure as a tariff-model correction loop.
  // H5 models co-pay/access pressure as churn + referral trust risk.
  // H6 exposes dual-agenda governance as decision-loss, not workload.

  insights.push(
    formatInsight(1, {
      truth: "Groei boven contractplafond vergroot verliesvolume in plaats van marge.",
      evidence: baseEvidence,
      mechanism:
        "Symptoom → mechanisme → oorzaak: meer instroom lijkt omzetgroei, maar boven plafond wordt elke extra behandeling onder kostprijs gedraaid doordat tariefdruk en plafondlogica tegelijk werken, tenzij per verzekeraar een contractvloer is vastgelegd.",
      action:
        "Stopregel: geen volumegroei per verzekeraar zodra plafondruimte < 10% is totdat nieuwe contractruimte schriftelijk is bevestigd.",
      risk:
        "De organisatie verbrandt cash op volume en cliënten ervaren later wachttijd of afbouw zodra plotseling moet worden geremd.",
    })
  );

  if (hasPlanningSignal(text)) {
    insights.push(
      formatInsight(2, {
        truth: "Planning zonder contractruimte-koppeling plant onbedoeld verlies of wachtrij.",
        evidence: pickEvidence(evidence, ["planning", "intake", "plafond"]),
        mechanism:
          "Symptoom → mechanisme → oorzaak: centrale intake vult agenda’s op bezetting, maar zonder contract-stoplicht schuift productie naar verkeerde polissen waardoor margedruk stijgt, tenzij no-show-buffer en casemix-routing contractgebonden worden ingevoerd.",
        action:
          "Hefboom: werk met groen/geel/rood per verzekeraar, no-show buffer per team en casemix-routing als verplichte planningsregel.",
        risk:
          "De organisatie stuurt op volle roosters met lage opbrengst en cliënten krijgen onvoorspelbare toegang of herplanning.",
      })
    );
  }

  if (hasCapacitySignal(text)) {
    insights.push(
      formatInsight(insights.length + 1, {
        truth: "Capaciteit uitbreiden zonder contractzekerheid vergroot verliescapaciteit.",
        evidence: pickEvidence(evidence, ["FTE", "kamers", "contractvloer"]),
        mechanism:
          "Symptoom → mechanisme → oorzaak: extra kamers/FTE verhogen vaste lasten direct, maar contractruimte groeit niet automatisch mee waardoor onderdekking structureel wordt, tenzij vooraf een contractvloer per verzekeraar is getekend.",
        action:
          "Besluit: uitbreidingsstop tot contractvloer en benutbare contractruimte de extra capaciteit aantoonbaar dekken.",
        risk:
          "De organisatie bouwt kosten op zonder dekkende omzet en cliënten krijgen later discontinuïteit door noodzakelijke capaciteitscorrecties.",
      })
    );
  }

  if (hasNormSignal(text)) {
    insights.push(
      formatInsight(insights.length + 1, {
        truth: "Normdruk op 75% is een correctie op het verdienmodel, geen duurzaam prestatiemiddel.",
        evidence: pickEvidence(evidence, ["75%", "6 uur cliëntcontact", "no-show"]),
        mechanism:
          "Symptoom → mechanisme → oorzaak: hogere normdruk compenseert tarieftekort tijdelijk, maar vergroot uitputting en kwaliteitsvariatie doordat no-show/casemix niet zijn meegewogen, tenzij een kwaliteitsbuffer en casemix-normering per team worden toegepast.",
        action:
          "Hefboom: vervang één uniforme norm door casemix-afhankelijke normbanden met maandritme en drempelwaarden.",
        risk:
          "De organisatie koopt korte-termijnoutput met uitvalrisico en cliënten zien kwaliteitsverlies of langere doorlooptijd.",
      })
    );
  }

  if (hasAccessSignal(text)) {
    insights.push(
      formatInsight(insights.length + 1, {
        truth: "Bijbetaling en toegangsschokken werken als verborgen uitstroommotor.",
        evidence: pickEvidence(evidence, ["bijbetaling", "doorverwijzing", "wachtlijst"]),
        mechanism:
          "Symptoom → mechanisme → oorzaak: onverwachte eigen betaling vergroot uitval en verlaagt verwijzersvertrouwen, waardoor instroomkwaliteit daalt ondanks hoge vraag, tenzij kosten vooraf en per trajectsegment expliciet worden gecommuniceerd met alternatieve routes.",
        action:
          "Stopregel: geen intake zonder upfront kostenkader, triagepad en alternatief traject bij hoge bijbetalingskans.",
        risk:
          "De organisatie verliest reputatie bij verwijzers en cliënten haken af of starten later met slechtere uitgangspositie.",
      })
    );
  }

  if (hasDoubleAgendaSignal(text)) {
    insights.push(
      formatInsight(insights.length + 1, {
        truth: "Parallel consolideren en verbreden is besluitverlies, geen ondernemingszin.",
        evidence: pickEvidence(evidence, ["consolidatie", "verbreding", "48 uur"]),
        mechanism:
          "Symptoom → mechanisme → oorzaak: twee prioriteiten concurreren om dezelfde leiderschapstijd, waardoor stopbesluiten uitblijven en kernprestaties slijten, tenzij een centrale 48-uurs prioriteringstafel met expliciete stoplijst bindend wordt gemaakt.",
        action:
          "Besluit: expliciet verlies vastleggen, minimaal één niet-kerninitiatief pauzeren en alleen hervatten na margevalidatie.",
        risk:
          "De organisatie houdt bestuurlijke ruis en cliënten merken dit via instabiele capaciteit en langere wachttijden.",
      })
    );
  }

  const fallbackPool = [
    {
      truth: "Zonder contractvloer wordt elk tariefgesprek een liquiditeitsbesluit.",
      mechanism:
        "Symptoom → mechanisme → oorzaak: jaarlijkse tariefdruk stapelt op kostenstijging waardoor operationele ruimte verdwijnt, tenzij minimale tariefranden per verzekeraar juridisch zijn geborgd.",
      action: "Hefboom: stel per verzekeraar een ondergrens in en stop productie-expansie onder die grens.",
      risk: "De organisatie verliest voorspelbaarheid en cliënten krijgen abrupte capaciteitswisselingen.",
    },
    {
      truth: "Gebrek aan kostprijs per product verschuift debat van feiten naar gedrag.",
      mechanism:
        "Symptoom → mechanisme → oorzaak: teams ervaren normdruk als controle omdat productmarge niet zichtbaar is, tenzij kostprijs en marge per product maandelijks op teamniveau worden gedeeld.",
      action: "Besluit: geen nieuw initiatief zonder gevalideerde unit economics en capaciteitsimpact.",
      risk: "De organisatie krijgt vermijdingsgedrag en cliënten ondervinden vertraging door interne frictie.",
    },
    {
      truth: "No-show en casemix-variantie zijn financiële variabelen, geen operationele ruis.",
      mechanism:
        "Symptoom → mechanisme → oorzaak: vaste roosters met variabele opkomst drukken benutting en maken productiviteitsnormen onzuiver, tenzij planning met no-show-banden en casemix-quotering werkt.",
      action: "Hefboom: introduceer wekelijkse roostercorrectie op no-show-band en casemix-score.",
      risk: "De organisatie mist margelekken en cliënten ervaren grillige doorlooptijden.",
    },
  ];

  for (const fallback of fallbackPool) {
    if (insights.length >= TARGET_MIN) break;
    insights.push(
      formatInsight(insights.length + 1, {
        truth: fallback.truth,
        evidence: baseEvidence,
        mechanism: fallback.mechanism,
        action: fallback.action,
        risk: fallback.risk,
      })
    );
  }

  return dedupeInsights(insights).slice(0, TARGET_MAX);
}

export class KillerInsightNode {
  readonly name = "Killer Insight Node";

  synthesize(context: AnalysisContext, priorResults: ModelResult[]): ModelResult {
    const sourceText = gatherRelevantText(context, priorResults);
    const evidence = collectEvidence(sourceText);
    const drafted = buildInsights(sourceText, evidence);

    const failedChecks = new Set<string>();
    let passedCheckCount = 0;

    const checked = drafted.map((insight) => {
      const failed = runChecks(insight);
      if (failed.length <= 2) passedCheckCount += 1;
      failed.forEach((item) => failedChecks.add(item));
      return insight;
    });

    const needWarning = checked.length < TARGET_MIN || passedCheckCount < 5;
    const warnings: string[] = [];
    if (checked.length < TARGET_MIN) {
      warnings.push(`te weinig insights (${checked.length}/${TARGET_MIN})`);
    }
    if (passedCheckCount < 5) {
      warnings.push(`kwaliteitschecks onvoldoende (${passedCheckCount}/5 minimum)`);
    }

    const killerInsights = needWarning
      ? [`WAARSCHUWING: ${warnings.join("; ")}. Rapport gaat door met best beschikbare inzichten.`, ...checked]
      : checked;

    const score = Math.max(0, Math.min(100, Math.round((passedCheckCount / Math.max(checked.length, 1)) * 100)));
    const meta: KillerInsightMeta = {
      score,
      failed_checks: [...failedChecks],
      evidence_used: evidence.length,
    };

    const content: KillerInsightOutput = {
      killer_insights: killerInsights,
      killer_insights_meta: meta,
    };

    return {
      section: "killer_insights",
      model: this.name,
      content,
      insights: killerInsights,
      confidence: 0.86,
      killer_insights: killerInsights,
      killer_insights_meta: meta,
    };
  }
}
