import { AureliusSlotKernelV4, type SlotId } from "@/aurelius/synthesis/kernel/AureliusSlotKernelV4";
import type { NormalizedStrategicCase } from "./CaseNormalizationEngine";
import type { StrategicInterventionRecord, StrategicOutcomeRecord } from "@/aurelius/data/StrategicDataSchema";

type SlotInput = {
  strategic_case: NormalizedStrategicCase;
  interventions: StrategicInterventionRecord[];
  outcomes: StrategicOutcomeRecord[];
  historical_learning_section?: string;
  source_report?: string;
};

const SLOT_BY_NUMBER: Record<number, SlotId> = {
  1: "dominanteThese",
  2: "kernspanning",
  3: "keerzijde",
  4: "prijsUitstel",
  5: "mandaat",
  6: "onderstroom",
  7: "faalmechanisme",
  8: "interventie",
  9: "besluitkader",
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ensureSentenceEnding(value: string): string {
  const source = normalize(value);
  if (!source) return source;
  if (/[.!?]["')\]]?$/.test(source)) return source;
  return `${source}.`;
}

function parseNumberedSections(source: string): Map<number, string> {
  const text = String(source ?? "").replace(/\r\n/g, "\n");
  const canonicalHeading =
    "Dominante These|Structurele Kernspanning|Keerzijde van de keuze|De Prijs van Uitstel|Mandaat & Besluitrecht|Onderstroom & Informele Macht|Faalmechanisme|90-Dagen Interventieontwerp|Besluitkader";
  const headingRegex = new RegExp(`^(?:###\\s*)?([1-9])\\.\\s+(?:${canonicalHeading})\\s*$`, "gmi");
  const headings = [...text.matchAll(headingRegex)];
  const sections = new Map<number, string>();
  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i];
    const next = headings[i + 1];
    const number = Number(current[1]);
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? text.length;
    const body = text.slice(start, end).trim();
    if (!Number.isFinite(number) || number < 1 || number > 9) continue;
    if (body) sections.set(number, body);
  }
  return sections;
}

function interventionLines(
  interventions: StrategicInterventionRecord[],
  outcomes: StrategicOutcomeRecord[]
): string[] {
  const outcomeByIntervention = new Map(outcomes.map((row) => [row.intervention_id, row]));
  return interventions.slice(0, 6).map((item, index) => {
    const outcome = outcomeByIntervention.get(item.intervention_id);
    return [
      `Interventie ${index + 1}: ${item.beschrijving}`,
      `Actie: ${item.beschrijving}`,
      `Eigenaar: MT`,
      `Deadline: ${item.implementatie_datum}`,
      `KPI: Implementatiestatus ${outcome?.implementatie_succes ?? "te bepalen"}`,
      "Escalatiepad: >48 uur blokkade = escalatie naar RvT.",
      `Casus-anker: ${item.interventie_type}`,
    ].join("\n");
  });
}

function fallbackBySlot(input: SlotInput): Record<SlotId, string> {
  const kase = input.strategic_case;
  const interventions = interventionLines(input.interventions, input.outcomes);
  const outcomeSummary = input.outcomes
    .slice(0, 4)
    .map((item) => `${item.intervention_id}: ${item.implementatie_succes} (${item.financieel_effect})`)
    .join("\n");

  return {
    dominanteThese: [
      `Kernzin: ${kase.dominant_thesis}.`,
      `Dominant probleem: ${kase.dominant_problem}.`,
      `Categorie: ${kase.normalized_problem_label}.`,
    ].join("\n"),
    kernspanning: [
      `Kernzin: De kernspanning ligt tussen ${kase.gekozen_strategie} en uitvoerbare capaciteit.`,
      `Mechanismen: ${kase.mechanisms.slice(0, 4).join(" | ") || "Niet expliciet gespecificeerd."}`,
    ].join("\n"),
    keerzijde: [
      "Kernzin: De keuze voor focus vraagt expliciet tijdelijk verlies op niet-kernactiviteiten.",
      `Strategische opties: ${kase.strategic_options.slice(0, 3).join(" || ") || "Niet expliciet."}`,
    ].join("\n"),
    prijsUitstel: [
      "Kernzin: Uitstel verhoogt financiële en operationele druk en verkleint bestuurlijke bewegingsruimte.",
      "30/60/90-logica: zonder heldere volgorde verschuift risico van cijfers naar gedrag en executie.",
    ].join("\n"),
    mandaat: [
      "Kernzin: Mandaat moet centraal worden belegd met expliciet besluitrecht en escalatieritme.",
      "Besluitrecht: MT primair, RvT bevestigt uitzonderingen op stopregels.",
    ].join("\n"),
    onderstroom: [
      "Kernzin: Onderstroomfrictie ontstaat wanneer normdruk niet wordt gekoppeld aan transparante margelogica.",
      "Gedragseffect: teamgesprekken over productie en capaciteit moeten ritmisch en cijfergedreven worden gemaakt.",
    ].join("\n"),
    faalmechanisme: [
      "Kernzin: Parallelle prioriteiten zonder stop-doing veroorzaken voorspelbare uitvoeringsdegradatie.",
      "Faalpad: scope-creep -> diffusie van eigenaarschap -> vertraagde escalatie -> margeslijtage.",
    ].join("\n"),
    interventie: interventions.length
      ? interventions.join("\n\n")
      : [
          "Maand 1",
          "Actie: Leg prioritering en stop-doing vast.",
          "Eigenaar: MT",
          "Deadline: binnen 30 dagen",
          "KPI: 100% besluitlabels met eigenaar",
          "Escalatiepad: >48 uur blokkade -> RvT",
          "Casus-anker: kernstabilisatie",
        ].join("\n"),
    besluitkader: [
      `Kernzin: Gekozen strategie is ${kase.gekozen_strategie}.`,
      "Besluitregel: geen nieuwe initiatieven zonder margevalidatie en capaciteitsimpact.",
      input.historical_learning_section
        ? input.historical_learning_section
        : "### HISTORISCHE LEERINZICHTEN\nNog geen historische data beschikbaar.",
      outcomeSummary ? `Resultaatspoor:\n${outcomeSummary}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function ensureUniqueContent(content: string, slotId: SlotId, used: Set<string>): string {
  let normalized = ensureSentenceEnding(content);
  if (!normalized) normalized = `Kernzin: Inhoud aangevuld voor slot ${slotId}.`;
  let candidate = normalized;
  let suffix = 1;
  while (used.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = ensureSentenceEnding(`${normalized}\n\nSpecifieke focus: ${slotId} #${suffix}.`);
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export function buildSlotLockedDocumentV4(input: SlotInput): string {
  const kernel = new AureliusSlotKernelV4();
  const parsed = parseNumberedSections(input.source_report ?? "");
  const fallback = fallbackBySlot(input);
  const used = new Set<string>();

  for (let number = 1; number <= 9; number += 1) {
    const slotId = SLOT_BY_NUMBER[number];
    const fromSource = normalize(parsed.get(number));
    const raw = fromSource || fallback[slotId];
    const unique = ensureUniqueContent(raw, slotId, used);
    kernel.writeSlot(slotId, unique);
  }

  const assembled = kernel.assembleDocument();
  kernel.freeze();
  return assembled;
}
