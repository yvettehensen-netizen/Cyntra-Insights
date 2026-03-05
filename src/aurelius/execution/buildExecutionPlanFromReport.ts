import type { ExecutionPlan90D, ExecutionStep } from "./generate90DayPlan";

/**
 * Causal 90-day adapter
 * Bouwt altijd 6 kerninterventies (2 per maand) vanuit rapporttekst + casusankers.
 */
export function buildExecutionPlanFromReport(
  report: any
) {
  const sourceText = [
    String(report?.raw_markdown ?? ""),
    String(report?.executive_summary ?? ""),
    String(report?.sections?.interventieplan_90dagen?.content ?? ""),
    String(report?.sections?.opportunity_cost?.content ?? ""),
    String(report?.sections?.governance_impact?.content ?? ""),
  ]
    .filter(Boolean)
    .join("\n\n");

  const facts = extractPriorityFacts(sourceText);
  const quoteAnchors = extractQuoteAnchors(sourceText);
  const mergedAnchors = Array.from(new Set([...facts, ...quoteAnchors]));
  const byPattern = (patterns: RegExp[], fallback: string) =>
    mergedAnchors.find((item) => patterns.some((pattern) => pattern.test(item))) ?? fallback;
  const anchors = [
    byPattern([/\bloonkosten\b/i], "Loonkosten stijgen met 5%."),
    byPattern([/\btarieven?\s*2026\b/i, /\b7%\b/i], "Tarieven 2026 zijn 7% verlaagd."),
    byPattern([/\badhd\b/i], "ADHD-diagnostiek rond €90 per cliënt."),
    byPattern([/\bplafond\b/i, /€160\.?000/i], "Contractplafond circa €160.000 per jaar."),
    byPattern([/\bgesprekken per cliënt\b/i], "Gemiddeld 12 gesprekken per cliënt."),
    byPattern([/\bkostprijs\b/i], "Gemiddelde kostprijs circa €1800 per cliënt."),
    ...mergedAnchors,
  ];
  const pickAnchor = (index: number) => anchors[index % anchors.length];

  const monthActions = [
    {
      focus: "Besluitvorming en financiële stop-keuzes",
      steps: [
        "Bouw eerst een product-margekaart (GGZ-kern + verbreding) en leg daarna stop/door-keuzes vast.",
        "Zet contractondergrens en plafondstrategie per verzekeraar vast; geen contract zonder tariefvloer.",
      ],
      owner: ["CEO + CFO", "Commercieel lead + CFO"],
      kpi: [
        "Binnen 14 dagen heeft 100% aanbod een expliciet beslislabel met eigenaar.",
        "Per verzekeraar een tariefvloer + plafondstrategie vastgelegd.",
      ],
    },
    {
      focus: "Governance-herinrichting en capaciteitssturing",
      steps: [
        "Centraliseer intake- en capaciteitsbesluiten op marge + wachttijd en draai één centrale besluittafel met 48-uurs escalatie.",
        "Voer verplichte maandgesprekken op output + kwaliteit in.",
      ],
      owner: ["Directie", "HR lead"],
      kpi: [
        "100% blokkades heeft owner + besluitdatum; >=90% gesloten binnen 48 uur.",
        "100% behandelaren heeft maandgesprek + actiepunt.",
      ],
    },
    {
      focus: "Verankering, strategiebesluit en irreversibility",
      steps: [
        "Herdefinieer 75%-norm met kwaliteitsbuffer en borg dit in roosters en teamafspraken.",
        "Laat HR-loket alleen groeien bij positieve margevalidatie en neutrale/positieve capaciteitsimpact op kernzorg.",
      ],
      owner: ["HR/Operations", "Business lead HR-loket + CFO"],
      kpi: [
        ">=90% teams werkt met norm + kwaliteitsbuffer; overbelasting >2 weken daalt aantoonbaar.",
        "0 uitbreiding zonder margevalidatie + capaciteitsimpactanalyse.",
      ],
    },
  ] as const;

  const STEPS_PER_MONTH = 2;
  const toStep = (
    action: string,
    owner: string,
    metric: string,
    monthIndex: number,
    stepIndex: number
  ): ExecutionStep & { deadline: string; escalation: string; caseAnchor: string } => ({
    week: monthIndex * STEPS_PER_MONTH + stepIndex + 1,
    action,
    owner,
    metric,
    deadline: `Dag ${Math.min(90, monthIndex * 30 + (stepIndex + 1) * 12)}`,
    escalation: "Escalatie naar directie binnen 48 uur bij KPI-afwijking >10%.",
    caseAnchor: pickAnchor(monthIndex * STEPS_PER_MONTH + stepIndex),
  });

  const plan: ExecutionPlan90D = {
    objective:
      "Doorbreken van structurele kernspanning en herstel van executiekracht op basis van casusankers.",
    months: monthActions.map((month, monthIndex) => ({
      month: (monthIndex + 1) as 1 | 2 | 3,
      focus: month.focus,
      steps: month.steps.map((action, stepIndex) =>
        toStep(
          action,
          month.owner[stepIndex],
          month.kpi[stepIndex],
          monthIndex,
          stepIndex
        )
      ),
    })),
  };

  return plan;
}

function extractPriorityFacts(text: string): string[] {
  const source = String(text || "");
  const patterns: Array<{ re: RegExp; format: (m: RegExpMatchArray) => string }> = [
    { re: /loonkosten[^.\n]{0,120}?(\d+[,.]?\d*)\s*%/gi, format: (m) => `Loonkosten stijgen met ${m[1]}%.` },
    { re: /tarieven[^.\n]{0,120}?2026[^.\n]{0,120}?(\d+[,.]?\d*)\s*%[^.\n]{0,60}(verlaagd|gedaald)/gi, format: (m) => `Tarieven 2026 zijn ${m[1]}% ${m[2]}.` },
    { re: /adhd[-\s]?diagnostiek[^€\n]{0,120}?€\s?(\d[\d.,]*)/gi, format: (m) => `ADHD-diagnostiek rond €${m[1]} per cliënt.` },
    { re: /(?:maximum|plafond)[^€\n]{0,120}?€\s?(\d[\d.,]*)[^.\n]{0,40}?per jaar/gi, format: (m) => `Contractplafond circa €${m[1]} per jaar.` },
    { re: /(\d+[,.]?\d*)\s*%\s*productief/gi, format: (m) => `Doelnorm ${m[1]}% productiviteit.` },
    { re: /(\d+[,.]?\d*)\s*uur[^.\n]{0,80}?cliëntcontact[^.\n]{0,40}?per dag/gi, format: (m) => `${m[1]} uur cliëntcontact per dag als norm.` },
    { re: /gemiddeld[^.\n]{0,120}?(\d+[,.]?\d*)\s*gesprekken[^.\n]{0,40}?per cliënt/gi, format: (m) => `Gemiddeld ${m[1]} gesprekken per cliënt.` },
    { re: /(?:gemiddelde\s*)?kostprijs[^€\n]{0,120}?€\s?(\d[\d.,]*)[^.\n]{0,40}?per cliënt/gi, format: (m) => `Gemiddelde kostprijs circa €${m[1]} per cliënt.` },
    { re: /(?:bijbetalen|eigen bijdrage)[^.\n]{0,120}?(\d+[,.]?\d*)\s*-\s*(\d+[,.]?\d*)\s*%/gi, format: (m) => `Cliënten betalen ${m[1]}-${m[2]}% bij.` },
    { re: /vier teamvergaderingen per jaar/gi, format: () => "Overlegstructuur heeft vier teamvergaderingen per jaar." },
    { re: /dashboard[^.\n]{0,80}sinds 1 januari/gi, format: () => "Dashboard met productiepercentages loopt sinds 1 januari." },
    { re: /hr-loket[^.\n]{0,120}start[^.\n]{0,40}2 februari/gi, format: () => "HR-loket is gestart op 2 februari." },
    { re: /binnen 48 uur advies/gi, format: () => "HR-loket hanteert een 48-uurs adviesbelofte." },
    { re: /45 aanmeldingen[^.\n]{0,120}kick-?off/gi, format: () => "Kick-off had 45 aanmeldingen via Edens Bedrijvencontact." },
    { re: /vier extra kamers[^.\n]{0,120}dezelfde huur/gi, format: () => "Verhuizing levert vier extra kamers op voor dezelfde huur." },
    { re: /openheid over volledige cijfers[^.\n]{0,120}vermeden/gi, format: () => "Volledige financiële openheid intern is bewust beperkt." },
  ];

  const facts: string[] = [];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern.re)) {
      facts.push(pattern.format(match));
    }
  }

  // Parse explicit casusanker regels uit sectie 8 fallbacktekst indien aanwezig.
  for (const match of source.matchAll(/Casus-anker:\s*([^\n]+)/gi)) {
    const raw = String(match[1] || "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
    facts.push(...raw);
  }

  return Array.from(
    new Set(
      facts
        .map((f) => f.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  ).slice(0, 9);
}

function extractQuoteAnchors(text: string): string[] {
  const source = String(text || "");
  const quotes: string[] = [];
  const patterns: RegExp[] = [
    /De organisatie kampt met een zeer krappe marge[^.\n]+/gi,
    /De ADHD-diagnostiek kost nu €\s?\d[\d.,]*[^.\n]+/gi,
    /Medewerkers moeten minimaal \d+[,.]?\d*\s*%\s*productief[^.\n]+/gi,
    /Zorgverzekeraars leggen plafonds op declaraties[^.\n]+/gi,
    /openheid over volledige cijfers[^.\n]+vermeden[^.\n]*/gi,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = String(match[0] || "").replace(/\s+/g, " ").trim();
      if (value.length >= 40) quotes.push(value);
    }
  }

  return Array.from(new Set(quotes)).slice(0, 8);
}
