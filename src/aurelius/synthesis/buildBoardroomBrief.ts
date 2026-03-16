import type { BoardroomBrief } from "./types";
import type { RunCyntraResult } from "@/aurelius/hooks/useCyntraAnalysis";
import { runBoardOutputGuard } from "./boardOutputGuard";
import {
  AureliusSlotKernelV4,
  type SlotId,
} from "./kernel/AureliusSlotKernelV4";
import {
  assertOutputIntegrity,
  normalizeSectionBodyForOutput,
} from "./outputIntegrity";
import { ensureBoardroomOutputArtifacts } from "@/aurelius/narrative/BoardroomNarrativeComposer";
import { assertBoardroomReportStructure } from "@/aurelius/narrative/BoardroomReportStructureValidator";
import { validateBoardGradeOutput } from "@/aurelius/synthesis/validateBoardOutput";
import { shouldEmitStabilityConsoleWarnings } from "@/aurelius/stability/OutputContractGuard";

const SECTION_SLOT_MAP: Array<{ heading: RegExp; slot: SlotId }> = [
  { heading: /^\s*1\.\s+Dominante These\b/i, slot: "dominanteThese" },
  { heading: /^\s*1\.\s+Dominante Bestuurlijke These\b/i, slot: "dominanteThese" },
  { heading: /^\s*2\.\s+Structurele Kernspanning\b/i, slot: "kernspanning" },
  { heading: /^\s*2\.\s+Kernconflict\b/i, slot: "kernspanning" },
  { heading: /^\s*3\.\s+Keerzijde van de keuze\b/i, slot: "keerzijde" },
  { heading: /^\s*3\.\s+Expliciete Trade-offs\b/i, slot: "keerzijde" },
  { heading: /^\s*4\.\s+De Prijs van Uitstel\b/i, slot: "prijsUitstel" },
  { heading: /^\s*4\.\s+Opportunity Cost\b/i, slot: "prijsUitstel" },
  { heading: /^\s*5\.\s+Mandaat & Besluitrecht\b/i, slot: "mandaat" },
  { heading: /^\s*5\.\s+Governance Impact\b/i, slot: "mandaat" },
  { heading: /^\s*6\.\s+Onderstroom & Informele Macht\b/i, slot: "onderstroom" },
  { heading: /^\s*6\.\s+Machtsdynamiek & Onderstroom\b/i, slot: "onderstroom" },
  { heading: /^\s*7\.\s+Faalmechanisme\b/i, slot: "faalmechanisme" },
  { heading: /^\s*7\.\s+Executierisico\b/i, slot: "faalmechanisme" },
  { heading: /^\s*8\.\s+90-Dagen Interventieontwerp\b/i, slot: "interventie" },
  { heading: /^\s*8\.\s+90-Dagen Interventieplan\b/i, slot: "interventie" },
  { heading: /^\s*9\.\s+Besluitkader\b/i, slot: "besluitkader" },
  { heading: /^\s*9\.\s+Decision Contract\b/i, slot: "besluitkader" },
];

const SLOT_FALLBACKS: Record<SlotId, string> = {
  dominanteThese:
    "Kernzin: Structurele druk ondermijnt binnen 12 maanden de kerncapaciteit en vereist directe consolidatiekeuze.",
  kernspanning:
    "Kernzin: Parallel sturen op consolidatie en verbreding vergroot het liquiditeitsrisico zolang kostprijsinzicht ontbreekt.",
  keerzijde:
    "Kernzin: Consolidatie levert grip op marge en contractering op, maar vraagt tijdelijk verlies van groeitempo buiten de kern.",
  prijsUitstel:
    "Kernzin: Uitstel veroorzaakt voorspelbaar verlies van marge, capaciteit en bestuurlijke voorspelbaarheid binnen 12 tot 18 maanden.",
  mandaat:
    "Kernzin: Centrale besluitvorming op capaciteit, contractruimte en portfolio wordt bindend met 48-uurs escalatieritme.",
  onderstroom:
    "Kernzin: Vermijding van productiegesprekken en beperkte financiële openheid blokkeert executie in de onderstroom.",
  faalmechanisme:
    "Kernzin: Zonder expliciete volgorde en stoplijst loopt de organisatie vast in dubbel sturen en vertraagde uitvoering.",
  interventie:
    "Kernzin: Het 90-dagenplan borgt eigenaarschap, deadlines, KPI-sturing en automatische escalatie op blokkades.",
  besluitkader:
    "Kernzin: Geen nieuw initiatief zonder margevalidatie en capaciteitsimpactanalyse; bij KPI-mis beslist centrale prioritering bindend.",
};

const SLOT_DECISION_PRESSURE: Record<SlotId, string> = {
  dominanteThese:
    "Zonder consolidatie binnen 12 maanden verliest de GGZ-kern direct behandelcapaciteit.",
  kernspanning:
    "Zonder volgordebesluit tussen consolideren en verbreden neemt liquiditeitsdruk direct toe.",
  keerzijde:
    "Zonder expliciete stopkeuzes blijft groei buiten de kern verliesvolume vergroten.",
  prijsUitstel:
    "Zonder correctie binnen 90 dagen verschuift een financieel vraagstuk naar een cultuur- en uitvoeringsprobleem.",
  mandaat:
    "Zonder bindend besluitrecht op capaciteit en contractruimte blijft governance niet afdwingbaar.",
  onderstroom:
    "Zonder ritmische sturing op gedrag blijft informele macht formele besluiten neutraliseren.",
  faalmechanisme:
    "Zonder maandelijkse correctie schuift escalatie naar achterafsturing met hoger capaciteitsverlies.",
  interventie:
    "Zonder dag-30, dag-60 en dag-90 sluiting blijft het plan een intentie zonder executiekracht.",
  besluitkader:
    "Zonder expliciet verlies, mandaatverschuiving en stopregels is het besluit bestuurlijk niet afdwingbaar.",
};

const BRIEF_FALLBACKS = {
  thesis: "Dominante these kon niet automatisch worden bepaald.",
  conflict: "Strategisch conflict kon niet automatisch worden bepaald.",
  boardQuestion: "Bestuurlijke vraag kon niet automatisch worden bepaald.",
  stressTest:
    "Boardroom stresstest kon niet automatisch worden bepaald. Zonder expliciete keuze neemt strategische frictie verder toe.",
  insights: "Killer insights konden niet automatisch worden bepaald.",
  interventionPlan: "Interventieplan kon niet automatisch worden bepaald.",
  openQuestions:
    "- Welke keuze wordt de komende 90 dagen expliciet niet meer gefinancierd?\n- Welke KPI dwingt herbesluit af als de gekozen koers niet werkt?\n- Welke bestuurlijke bottleneck moet binnen 30 dagen expliciet worden opgeheven?",
};

function splitSentences(text: string): string[] {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeToSentences(text: string): string[] {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return [];
      const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return [];
      const compact = lines
        .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))
        .map((line) => line.replace(/^[A-Z][^:]{1,40}:\s*/i, ""))
        .join(" ");
      return splitSentences(compact);
    })
    .flat()
    .map((sentence) => sentence.replace(/\s+\./g, ".").trim())
    .filter(Boolean);
}

function clampSentenceCount(sentences: string[], maxSentences: number): string {
  return sentences.slice(0, maxSentences).join(" ").trim();
}

function buildContextParagraph(slotId: SlotId, sentences: string[]): string {
  const core = clampSentenceCount(sentences, 3);
  if (!core) return "";
  if (slotId === "dominanteThese") {
    const normalized = core.charAt(0).toLowerCase() + core.slice(1);
    return clampSentenceCount(
      [
        `De dominante bestuurlijke these is dat ${normalized}`,
        "De spanning ontstaat doordat ambitie en operationele realiteit niet meer in hetzelfde ritme lopen.",
      ],
      4
    );
  }
  return clampSentenceCount(
    [core, "De spanning zit in het verschil tussen bestuurlijke ambitie en uitvoerbare capaciteit."],
    4
  );
}

function buildMechanismParagraph(sentences: string[]): string {
  const symptom = sentences.find((sentence) =>
    /\b(druk|uitval|vertraging|verlies|frictie|onrust|plafond|tekort)\b/i.test(sentence)
  );
  const structuralCause = sentences.find((sentence) =>
    /\b(kostprijs|contract|tarief|capaciteit|mandaat|transparantie|planning|norm)\b/i.test(sentence)
  );
  const systemEffect = sentences.find((sentence) =>
    /\b(liquiditeit|marge|behandelcapaciteit|wachtlijst|voorspelbaarheid|doorlooptijd)\b/i.test(sentence)
  );

  return clampSentenceCount(
    [
      `Mechanisme: ${symptom ?? "Symptomen worden zichtbaar als vertraging, druk en oplopende frictie."}`,
      `Structurele oorzaak: ${structuralCause ?? "Randvoorwaarden in contracten, capaciteit en sturing begrenzen wat uitvoerbaar is."}`,
      `Systeemeffect: ${systemEffect ?? "Daardoor verschuift druk van cijfers naar gedrag, planning en continuiteit."}`,
    ],
    4
  );
}

function buildImplicationParagraph(slotId: SlotId, sentences: string[]): string {
  const implication = sentences.find((sentence) =>
    /\b(bestuurlijk|besluit|mandaat|escalatie|stopregel|prioritering|keuze)\b/i.test(sentence)
  );
  return clampSentenceCount(
    [
      `Bestuurlijke implicatie: ${implication ?? "Het bestuur moet keuzevolgorde, mandaat en stopregels expliciet en afdwingbaar maken."}`,
      SLOT_DECISION_PRESSURE[slotId],
    ],
    4
  );
}

function enforceNarrativeSectionFlow(slotId: SlotId, body: string): string {
  const source = normalizeSectionBodyForOutput(body, slotId);
  const sentences = normalizeToSentences(source);
  if (!sentences.length) return source.trim();

  const context = buildContextParagraph(slotId, sentences);
  const mechanism = buildMechanismParagraph(sentences);
  const implication = buildImplicationParagraph(slotId, sentences);
  return [context, mechanism, implication].filter(Boolean).join("\n\n").trim();
}

function buildSituationReconstruction(executiveText: string, narrativeText: string): string {
  const source = `${executiveText}\n${narrativeText}`;
  const lines = String(source ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const facts = lines
    .filter((line) =>
      /\b(ggz|jeugdzorg|contract|verzekeraar|plafond|productiviteit|behandel|intake|planning|capaciteit)\b/i.test(
        line
      )
    )
    .slice(0, 2);
  const numbers = lines
    .filter((line) => /€\s?\d|(?:\d+[,.]?\d*\s*%|\b\d+\s*(?:dagen|maanden|FTE|cliënten?)\b)/i.test(line))
    .slice(0, 2);

  const factSentence =
    facts.length > 0
      ? facts.join(" ")
      : "De organisatie opereert in een context met hoge druk op capaciteit, tarieven en contractruimte.";
  const numberSentence =
    numbers.length > 0
      ? numbers.join(" ")
      : "Kritieke stuurcijfers zijn deels beschikbaar, maar nog niet overal ritmisch gekoppeld aan besluitvorming.";

  return [
    "0. Situatiereconstructie",
    `${factSentence} ${numberSentence}`.replace(/\s+/g, " ").trim(),
  ].join("\n");
}

function safeText(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function ensureRequiredBoardSections(text: string, intelligence: RunCyntraResult): string {
  const source = String(text ?? "").trim();
  const lower = source.toLowerCase();
  const additions: string[] = [];
  const killerInsights = readKillerInsights(intelligence);
  const interventionFallback = source.match(/90-dagen interventie(?:ontwerp|plan)[\s\S]*?(?=\n### |\n\d+\. |$)/i)?.[0] || "";

  if (!/(dominante these|executive thesis|bestuurlijke these|bestuurlijke kernsamenvatting)/i.test(lower)) {
    additions.push(`### EXECUTIVE THESIS\n${BRIEF_FALLBACKS.thesis}`);
  }
  if (!/kernconflict|strategisch kernconflict|strategische spanning/i.test(lower)) {
    additions.push(`### STRATEGISCHE SPANNING\n${BRIEF_FALLBACKS.conflict}`);
  }
  if (!/boardroom question|bestuurlijke vraag|board vraag|besluitvraag/i.test(lower)) {
    additions.push(`### BESTUURLIJKE VRAAG\n${BRIEF_FALLBACKS.boardQuestion}`);
  }
  if (!/stresstest|stress test|bestuurlijke stresstest/i.test(lower)) {
    additions.push(`### BOARDROOM STRESSTEST\n${BRIEF_FALLBACKS.stressTest}`);
  }
  if (!/killer insights|nieuwe inzichten|doorbraakinzichten/i.test(lower)) {
    additions.push(
      `### DOORBRAAKINZICHTEN\n${
        killerInsights.length ? killerInsights.slice(0, 5).join("\n") : BRIEF_FALLBACKS.insights
      }`
    );
  }
  if (!/90-dagen interventie|interventieplan|bestuurlijk actieplan/i.test(lower)) {
    additions.push(
      `### BESTUURLIJK ACTIEPLAN\n${safeText(interventionFallback, BRIEF_FALLBACKS.interventionPlan)}`
    );
  }
  if (!/open questions|open vragen|open strategische vragen/i.test(lower)) {
    additions.push(`### OPEN STRATEGISCHE VRAGEN\n${BRIEF_FALLBACKS.openQuestions}`);
  }

  return additions.length ? [source, ...additions].filter(Boolean).join("\n\n") : source;
}

function extractNumberedSections(text: string): Partial<Record<SlotId, string>> {
  const source = String(text ?? "").trim();
  if (!source) return {};
  const headingRegex = /^\s*[1-9]\.\s+[^\n]+$/gm;
  const matches = [...source.matchAll(headingRegex)];
  if (!matches.length) return {};

  const extracted: Partial<Record<SlotId, string>> = {};
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const heading = String(match[0] ?? "").trim();
    const slot = SECTION_SLOT_MAP.find((entry) => entry.heading.test(heading))?.slot;
    if (!slot || extracted[slot]) continue;

    const start = (match.index ?? 0) + heading.length;
    const end = matches[index + 1]?.index ?? source.length;
    const body = normalizeSectionBodyForOutput(source.slice(start, end).trim(), slot);
    if (body) extracted[slot] = body;
  }
  return extracted;
}

function readKillerInsights(intelligence: RunCyntraResult): string[] {
  const raw = (intelligence as RunCyntraResult & { killer_insights?: unknown }).killer_insights;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);
}

type BriefCaseStructureItem = {
  theme: string;
  description?: string;
  signals?: string[];
};

type BriefStrategicConflict = {
  tensionA: string;
  tensionB: string;
  explanation: string;
};

function normalizeTheme(theme: string): string {
  return String(theme ?? "").replace(/\s+/g, " ").trim();
}

function inferCaseStructure(source: string): BriefCaseStructureItem[] {
  const catalog: Array<{ theme: string; description: string; patterns: RegExp[] }> = [
    {
      theme: "Cultuur & Eigenaarschap",
      description: "Retentie, betrokkenheid en professionele verantwoordelijkheid als kwaliteitsmotor.",
      patterns: [/\bcultuur\b/i, /\beigenaarschap\b/i, /\bziekteverzuim\b/i, /\bmede-?eigenaar\b/i],
    },
    {
      theme: "Netwerkstrategie",
      description: "Impactvergroting via partners, kennisdeling en licenties.",
      patterns: [/\bnetwerk\b/i, /\bpartners?\b/i, /\blicentie\b/i, /\bkennisdeling\b/i],
    },
    {
      theme: "Wachttijdinnovatie",
      description: "Triage en kortdurende interventies als capaciteitshefboom.",
      patterns: [/\bwachttijd\b/i, /\btriage\b/i, /\bwachtlijst\b/i, /\bkort traject\b/i, /\bintake\b/i],
    },
    {
      theme: "Beleidsinvloed",
      description: "Systeembeinvloeding via gemeenten, VWS/VNG en sectornetwerken.",
      patterns: [/\bbeleid\b/i, /\bgemeente\b/i, /\bvng\b/i, /\bvws\b/i, /\bbeweging van nul\b/i],
    },
    {
      theme: "Financiele Druk",
      description: "Tariefdruk en loonkosten vragen expliciete margelogica.",
      patterns: [/\bmarge\b/i, /\btarief\b/i, /\bloonkosten?\b/i, /\bcontract\b/i, /\bvergrijzing\b/i],
    },
  ];

  const lines = String(source ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const inferred = catalog
    .map((item) => {
      const signals = lines
        .filter((line) => item.patterns.some((pattern) => pattern.test(line)))
        .slice(0, 3);
      return {
        theme: item.theme,
        description: item.description,
        signals,
      };
    })
    .filter((item) => item.signals.length > 0)
    .slice(0, 5);

  if (inferred.length > 0) return inferred;

  return [
    {
      theme: "Capaciteit & Kwaliteit",
      description: "Balans tussen zorgkwaliteit en uitvoerbare groei.",
      signals: lines.slice(0, 2),
    },
  ];
}

function readCaseStructure(intelligence: RunCyntraResult, source: string): BriefCaseStructureItem[] {
  const payload = intelligence as RunCyntraResult & {
    caseStructure?: unknown;
    state?: { caseStructure?: unknown };
  };
  const fromPayload = payload.caseStructure ?? payload.state?.caseStructure;
  if (Array.isArray(fromPayload)) {
    const mapped = fromPayload
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const theme = normalizeTheme(String(record.theme ?? ""));
        if (!theme) return null;
        const description =
          typeof record.description === "string" ? record.description.trim() : undefined;
        const signals = Array.isArray(record.signals)
          ? record.signals.map((signal) => String(signal ?? "").trim()).filter(Boolean).slice(0, 3)
          : [];
        return { theme, description, signals };
      })
      .filter(Boolean) as BriefCaseStructureItem[];
    if (mapped.length > 0) {
      const padded = [...mapped];
      const fallback = inferCaseStructure(source);
      for (const item of fallback) {
        if (padded.some((existing) => existing.theme === item.theme)) continue;
        padded.push(item);
        if (padded.length >= 3) break;
      }
      return padded.slice(0, 5);
    }
  }
  const inferred = inferCaseStructure(source);
  if (inferred.length >= 3) return inferred.slice(0, 5);
  const paddingCatalog: BriefCaseStructureItem[] = [
    {
      theme: "Governance & Besluitritme",
      description: "Mandaat, escalatie en prioritering bepalen of keuzes uitvoerbaar blijven.",
      signals: [],
    },
    {
      theme: "Capaciteit & Continuiteit",
      description: "Instroom, werkdruk en uitvoerbaarheid lopen vast zonder harde toegangskeuzes.",
      signals: [],
    },
    {
      theme: "Positionering & Contractruimte",
      description: "Contractkwaliteit en scherpe propositie bepalen of groei bestuurlijk houdbaar is.",
      signals: [],
    },
  ];
  const padded = [...inferred];
  for (const item of paddingCatalog) {
    if (padded.some((existing) => existing.theme === item.theme)) continue;
    padded.push(item);
    if (padded.length >= 3) break;
  }
  return padded.slice(0, 5);
}

function inferStrategicConflict(source: string): BriefStrategicConflict {
  const low = source.toLowerCase();
  if (/\bkwaliteit|cultuur|behandelrelatie|eigenaarschap\b/.test(low)) {
    return {
      tensionA: "Behandelkwaliteit beschermen",
      tensionB: "Maatschappelijke impact vergroten",
      explanation:
        "Groei wordt begrensd om kwaliteit en eigenaarschap te borgen, waardoor impactgroei vooral via netwerkadoptie en modelverspreiding moet plaatsvinden.",
    };
  }
  if (/\bmarge|tarief|kostprijs|loonkosten|contract\b/.test(low)) {
    return {
      tensionA: "Financiele weerbaarheid borgen",
      tensionB: "Innovatieruimte behouden",
      explanation:
        "Kostendruk vraagt directe margecontrole, terwijl toekomstige impact afhankelijk blijft van doorlopende innovatie en overdraagbare modellen.",
    };
  }
  return {
    tensionA: "Autonomie behouden",
    tensionB: "Standaardisatie verhogen",
    explanation:
      "Lokale ruimte versnelt maatwerk, maar zonder standaardkaders daalt voorspelbaarheid van kwaliteit en uitvoerbaarheid.",
  };
}

function readStrategicConflict(
  intelligence: RunCyntraResult,
  source: string
): BriefStrategicConflict {
  const payload = intelligence as RunCyntraResult & {
    strategicConflict?: unknown;
    state?: { strategicConflict?: unknown };
  };
  const fromPayload = payload.strategicConflict ?? payload.state?.strategicConflict;
  if (fromPayload && typeof fromPayload === "object") {
    const record = fromPayload as Record<string, unknown>;
    const tensionA = String(record.tensionA ?? "").trim();
    const tensionB = String(record.tensionB ?? "").trim();
    const explanation = String(record.explanation ?? "").trim();
    if (tensionA && tensionB && explanation) {
      return { tensionA, tensionB, explanation };
    }
  }
  return inferStrategicConflict(source);
}

function renderCaseStructureSection(caseStructure: BriefCaseStructureItem[]): string {
  const lines = caseStructure.slice(0, 5).map((item) => {
    const signals = (item.signals ?? []).filter(Boolean).slice(0, 2).join(" | ");
    const description = item.description ? ` — ${item.description}` : "";
    const signalText = signals ? ` (signals: ${signals})` : "";
    return `- ${item.theme}${description}${signalText}`;
  });
  return ["### CASE STRUCTURE", ...lines].join("\n").trim();
}

function renderStrategicConflictSection(conflict: BriefStrategicConflict): string {
  return [
    "### STRATEGISCH KERNCONFLICT",
    "Strategisch spanningsveld:",
    `A: ${conflict.tensionA}`,
    `B: ${conflict.tensionB}`,
    "",
    "Interpretatie:",
    conflict.explanation,
  ].join("\n");
}

export function buildBoardroomBrief(
  intelligence: RunCyntraResult,
  context: string
): BoardroomBrief {
  const finalText = intelligence.report ?? BRIEF_FALLBACKS.thesis;
  const processedExecutiveText = runBoardOutputGuard(finalText, {
    fullDocument: false,
  });
  const processedNarrative = runBoardOutputGuard(String(context ?? ""), {
    fullDocument: true,
  });

  const sectionHeadings = new Set<string>();
  const pushUnique = (heading: string, value: string, target: string[]) => {
    if (!heading || !value) return;
    const key = heading.toLowerCase().trim();
    if (!sectionHeadings.has(key)) {
      sectionHeadings.add(key);
      target.push(value);
    }
  };

  const keyChoices: string[] = [];
  pushUnique(
    "korte termijn stabiliteit versus lange termijn transformatie",
    "Korte termijn stabiliteit versus lange termijn transformatie",
    keyChoices
  );
  pushUnique(
    "decentrale autonomie versus centrale sturing",
    "Decentrale autonomie versus centrale sturing",
    keyChoices
  );

  const kernel = new AureliusSlotKernelV4();
  const extractedSections = extractNumberedSections(processedNarrative);
  const killerInsights = readKillerInsights(intelligence);
  const slotOrder: SlotId[] = [
    "dominanteThese",
    "kernspanning",
    "keerzijde",
    "prijsUitstel",
    "mandaat",
    "onderstroom",
    "faalmechanisme",
    "interventie",
    "besluitkader",
  ];
  const writeCount: Record<SlotId, number> = {
    dominanteThese: 0,
    kernspanning: 0,
    keerzijde: 0,
    prijsUitstel: 0,
    mandaat: 0,
    onderstroom: 0,
    faalmechanisme: 0,
    interventie: 0,
    besluitkader: 0,
  };

  const traceHash = (value: string): string => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };

  for (const slotId of slotOrder) {
    let candidateRaw =
      extractedSections[slotId] ??
      (slotId === "dominanteThese" ? processedExecutiveText : SLOT_FALLBACKS[slotId]);
    if (slotId === "prijsUitstel" && killerInsights.length) {
      const killerBlock = killerInsights
        .map((insight) => insight.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean)
        .join(" ");
      candidateRaw = [
        `Nieuwe inzichten: ${killerBlock}`.trim(),
        String(candidateRaw ?? "").trim(),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    const candidate = enforceNarrativeSectionFlow(slotId, candidateRaw);
    writeCount[slotId] += 1;
    if (shouldEmitStabilityConsoleWarnings()) {
      console.info("[slot_write_trace]", {
        sectionId: slotId,
        hash: traceHash(candidate),
        writeCount: writeCount[slotId],
      });
    }
    kernel.writeSlot(slotId, candidate);
  }

  kernel.freeze();
  const stabilizedNarrative = kernel.assembleDocument();
  assertOutputIntegrity(stabilizedNarrative);
  const caseStructure = readCaseStructure(
    intelligence,
    `${processedExecutiveText}\n${processedNarrative}`
  );
  const strategicConflict = readStrategicConflict(
    intelligence,
    `${processedExecutiveText}\n${processedNarrative}`
  );
  const strategySections = [
    renderCaseStructureSection(caseStructure),
    renderStrategicConflictSection(strategicConflict),
  ]
    .filter(Boolean)
    .join("\n\n");
  const situationReconstruction = buildSituationReconstruction(
    processedExecutiveText,
    processedNarrative
  );
  const narrativeWithSituation = [situationReconstruction, strategySections, stabilizedNarrative]
    .filter(Boolean)
    .join("\n\n")
    .trim();
  let narrativeWithArtifacts = ensureBoardroomOutputArtifacts(narrativeWithSituation);
  narrativeWithArtifacts = ensureRequiredBoardSections(narrativeWithArtifacts, intelligence);
  assertBoardroomReportStructure(narrativeWithArtifacts);
  const boardGrade = validateBoardGradeOutput(narrativeWithArtifacts, { minScore: 85 });
  if (!boardGrade.pass) {
    narrativeWithArtifacts = [
      narrativeWithArtifacts,
      "### BOARD-GRADE VALIDATIE",
      `Status: SOFT_FAIL (score ${boardGrade.score}/${boardGrade.minScore})`,
      `Errors: ${boardGrade.errors.join(" | ")}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }
  if (!boardGrade.pass) {
    if (shouldEmitStabilityConsoleWarnings()) {
      console.warn("[BoardGrade][SOFT_FAIL]", {
        score: boardGrade.score,
        minScore: boardGrade.minScore,
        errors: boardGrade.errors,
        warnings: boardGrade.warnings,
      });
    }
  }

  return {
    executive_thesis: safeText(processedExecutiveText, BRIEF_FALLBACKS.thesis),

    central_tension: safeText(
      strategicConflict.explanation,
      "Spanning tussen huidige operationele realiteit en strategische noodzaak."
    ),

    strategic_narrative: narrativeWithArtifacts,

    key_tradeoffs: keyChoices,

    irreversible_decisions: [
      "Structuur van leiderschap",
      "Positionering in de markt",
    ],
  };
}
