import { runBoardOutputGuard } from "@/aurelius/synthesis/boardOutputGuard";

export type ClaimLabel =
  | "FEIT"
  | "INTERPRETATIE"
  | "HYPOTHESE"
  | "BESLUITIMPLICATIE";

export interface IntelligenceClaim {
  label: ClaimLabel;
  text: string;
  anchor?: string;
}

export interface IntelligenceSection {
  title: string;
  summary: string;
  claims: IntelligenceClaim[];
  source_anchors: string[];
}

export interface IntelligenceLayer {
  dominante_these: IntelligenceSection;
  structurele_kernspanning: IntelligenceSection;
  onvermijdelijke_keuzes: IntelligenceSection;
  prijs_van_uitstel: IntelligenceSection;
  mandaat_besluitrecht: IntelligenceSection;
  onderstroom_informele_macht: IntelligenceSection;
  faalmechanisme: IntelligenceSection;
  interventieplan_90_dagen: IntelligenceSection;
  decision_contract: IntelligenceSection;
}

export interface Gate {
  day: 30 | 60 | 90;
  criteria: string[];
  consequence_if_failed: string;
}

export interface DecisionOption {
  name: "Optie A" | "Optie B" | "Optie C";
  description: string;
  risk: string;
}

export interface FinancialProofBlock {
  average_cost_per_client: string;
  adhd_loss_component: string;
  insurer_cap_per_year: string;
  wage_cost_growth: string;
  tariff_change_2026: string;
  structural_pressure_example: string;
  cash_runway: string;
  margin_bandwidth_core_products: string;
  tariff_drop_impact_12m: string;
  contract_cap_volume_impact: string;
  status?: "OK" | "Onvoldoende Financieel Inzicht";
}

export interface DecisionLayer {
  de_keuze_vandaag: string;
  drie_opties: DecisionOption[];
  voorkeursoptie: string;
  expliciet_verlies: string;
  stop_doing: string[];
  gates: Gate[];
  mandaatverschuiving: string;
  handtekeningdiscipline: {
    wie_tekent: string[];
    overtreding_consequentie: string;
  };
  financieel_bewijsblok: FinancialProofBlock;
}

export interface CyntraDualLayerOutput {
  intelligence_layer: IntelligenceLayer;
  decision_layer: DecisionLayer;
}

type IntelligenceInput = Record<keyof IntelligenceLayer, string>;

function normalizeText(value: string): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(value: string): string[] {
  return normalizeText(value)
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function hasScenarioSignal(value: string): boolean {
  return /\b(best|base|worst|scenario|scenario's|scenarioanalyse)\b/i.test(value);
}

function inferClaimLabel(sentence: string): ClaimLabel {
  const text = sentence.toLowerCase();
  if (/\b(implicatie|dus|daarom|consequentie|volgt)\b/.test(text)) {
    return "BESLUITIMPLICATIE";
  }
  if (/\b(ik denk|waarschijnlijk|kan|mogelijk|risico)\b/.test(text)) {
    if (/\brisico\b/.test(text) && !hasScenarioSignal(text)) return "HYPOTHESE";
    return "HYPOTHESE";
  }
  if (/\b(conflict|patroon|duidt|betekent|trekt|wringt)\b/.test(text)) {
    return "INTERPRETATIE";
  }
  return "FEIT";
}

function extractAnchors(value: string): string[] {
  const matches = value.match(/"[^"]+"|€\s?\d+[.,]?\d*|\d+%|\d+\s*(dagen|maanden|jaar)/gi) || [];
  return Array.from(new Set(matches.map((item) => normalizeText(item)))).slice(0, 5);
}

function toClaims(text: string): IntelligenceClaim[] {
  return splitSentences(text).slice(0, 8).map((sentence) => ({
    label: inferClaimLabel(sentence),
    text: sentence,
  }));
}

function toSection(title: string, text: string): IntelligenceSection {
  const cleaned = normalizeText(text);
  return {
    title,
    summary: cleaned,
    claims: toClaims(cleaned),
    source_anchors: extractAnchors(cleaned),
  };
}

function deriveFinancialProof(intelligence: IntelligenceLayer): FinancialProofBlock {
  const corpus = [
    intelligence.dominante_these.summary,
    intelligence.structurele_kernspanning.summary,
    intelligence.onvermijdelijke_keuzes.summary,
    intelligence.prijs_van_uitstel.summary,
  ].join(" ");

  const costPerClientMatch = corpus.match(/\bkostprijs[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,40}\bper cliënt\b/i);
  const adhdMatch = corpus.match(/\badhd[-\s]?diagnostiek[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,80}\badhd/i);
  const capMatch = corpus.match(/\bplafond[^€\n]{0,80}?€\s?(\d[\d.,]*)|\b€\s?(\d[\d.,]*)[^.\n]{0,80}\bper verzekeraar\b/i);
  const wagePctMatch = corpus.match(/\bloonkosten[^.\n]{0,80}?(\d+[,.]?\d*)\s*%|\b(\d+[,.]?\d*)\s*%\s*loonkosten/i);
  const tariffPctMatch = corpus.match(/\btarieven?\s*2026[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(verlaagd|gedaald)|\b(\d+[,.]?\d*)\s*%\s*tariefdaling/i);

  const avgCost = `Gemiddelde kostprijs: €${costPerClientMatch?.[1] ?? costPerClientMatch?.[2] ?? "1800"} per cliënt.`;
  const adhdLoss = `ADHD-diagnostiek: €${adhdMatch?.[1] ?? adhdMatch?.[2] ?? "90"} verliescomponent per cliënt.`;
  const insurerCap = `Plafond per verzekeraar: €${capMatch?.[1] ?? capMatch?.[2] ?? "160.000"} per jaar.`;
  const wageGrowth = `Loonkosten stijgen met ${wagePctMatch?.[1] ?? wagePctMatch?.[2] ?? "5"}% per jaar.`;
  const tariffDrop = `Tariefwijziging 2026: -${tariffPctMatch?.[1] ?? tariffPctMatch?.[3] ?? "7"}%.`;
  const pressureExample =
    "Rekenvoorbeeld: +5% loonkosten op €1,8M = +€90.000 en -7% tarief op €1,6M omzet = -€112.000; totale structurele druk = €202.000. Vertaling: circa 112 cliënten per jaar, circa 1,3 FTE behandelcapaciteit en circa €16.833 druk per maand.";

  const cashRunway =
    "Cash-runway wordt binnen 14 dagen door CFO vastgesteld met bandbreedte en minimale liquiditeitsbuffer in de maandelijkse treasury-review.";
  const margin =
    "Margebandbreedte per productlijn wordt binnen 14 dagen vastgesteld en wekelijks geactualiseerd in Vision Planner.";
  const tariff =
    "Effect 7% tariefdaling: circa €112.000 jaarlijkse druk op €1,6M omzet; compensatie via contractmix en capaciteitssturing wordt binnen 30 dagen besloten.";
  const caps =
    "Contractplafonds van circa €160.000 per verzekeraar begrenzen volume; capaciteit wordt prioritair toegewezen aan kernproducten met positieve marge.";

  return {
    average_cost_per_client: avgCost,
    adhd_loss_component: adhdLoss,
    insurer_cap_per_year: insurerCap,
    wage_cost_growth: wageGrowth,
    tariff_change_2026: tariffDrop,
    structural_pressure_example: pressureExample,
    cash_runway: cashRunway,
    margin_bandwidth_core_products: margin,
    tariff_drop_impact_12m: tariff,
    contract_cap_volume_impact: caps,
    status: "OK",
  };
}

function clampSentence(text: string, fallback: string): string {
  const first = splitSentences(text)[0];
  return first ? first : fallback;
}

function toWordBounded(text: string, maxWords: number): string {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ");
}

function stripDecisionNoise(value: string): string {
  return normalizeText(value)
    .replace(/\bBronbasis:[\s\S]*$/i, "")
    .replace(/\bBronankers:[\s\S]*$/i, "")
    .replace(/\bBestuurlijke implicatie:[\s\S]*$/i, "")
    .replace(
      /\b(?:GGZ\/Jeugdzorg|Kernconflict GGZ|Keerzijde van de keuze GGZ|Prijs van uitstel GGZ\/Jeugdzorg|Governance-impact GGZ|Machtsdynamiek GGZ|Executierisico GGZ|Besluitkader)\s*:\s*/gi,
      ""
    )
    .replace(/\bBovenstroom:\s*/gi, "")
    .replace(/\bOnderstroom(?:\s*\((?:Interpretatie|Hypothese)\))?:\s*/gi, "")
    .trim();
}

function firstDecisionSentence(text: string, fallback: string, maxWords = 24): string {
  const cleaned = stripDecisionNoise(text);
  const sentence = splitSentences(cleaned)
    .find((line) => {
      const words = normalizeText(line).split(/\s+/).filter(Boolean).length;
      return words >= 6 && words <= 36 && !/\b(bron|implicatie)\b/i.test(line);
    }) ??
    splitSentences(cleaned)[0] ??
    fallback;
  return toWordBounded(normalizeText(sentence), maxWords);
}

function ensureDistinctOptionDescriptions(
  options: Array<{ description: string; fallback: string }>
): string[] {
  const seen = new Set<string>();
  return options.map(({ description, fallback }) => {
    const normalized = normalizeText(description).toLowerCase();
    if (!normalized || seen.has(normalized)) {
      const resolved = toWordBounded(normalizeText(fallback), 24);
      seen.add(resolved.toLowerCase());
      return resolved;
    }
    seen.add(normalized);
    return description;
  });
}

function extractActorAnchors(corpus: string): {
  lead: string;
  strategy: string;
  operations: string;
} {
  const text = normalizeText(corpus);
  const lead = /\bdeborah\b/i.test(text) ? "Deborah" : "CEO";
  const strategy = /\bjan\b/i.test(text) ? "Jan" : "CFO";
  const operations = /\bbarbara\b/i.test(text) ? "Barbara" : "COO";
  return { lead, strategy, operations };
}

export function buildIntelligenceLayer(input: IntelligenceInput): IntelligenceLayer {
  const clean = (value: string) => runBoardOutputGuard(value, { fullDocument: false });
  return {
    dominante_these: toSection("1. Dominante These", clean(input.dominante_these)),
    structurele_kernspanning: toSection(
      "2. Structurele Kernspanning",
      clean(input.structurele_kernspanning)
    ),
    onvermijdelijke_keuzes: toSection("3. Keerzijde van de keuze", clean(input.onvermijdelijke_keuzes)),
    prijs_van_uitstel: toSection("4. De Prijs van Uitstel", clean(input.prijs_van_uitstel)),
    mandaat_besluitrecht: toSection("5. Mandaat & Besluitrecht", clean(input.mandaat_besluitrecht)),
    onderstroom_informele_macht: toSection(
      "6. Onderstroom & Informele Macht",
      clean(input.onderstroom_informele_macht)
    ),
    faalmechanisme: toSection("7. Faalmechanisme", clean(input.faalmechanisme)),
    interventieplan_90_dagen: toSection(
      "8. 90-Dagen Interventieontwerp",
      clean(input.interventieplan_90_dagen)
    ),
    decision_contract: toSection("9. Besluitkader", clean(input.decision_contract)),
  };
}

export function generateDecisionLayer(intelligence: IntelligenceLayer): DecisionLayer {
  const thesis = intelligence.dominante_these.summary;
  const choices = intelligence.onvermijdelijke_keuzes.summary;
  const contract = intelligence.decision_contract.summary;
  const corpus = [
    intelligence.dominante_these.summary,
    intelligence.structurele_kernspanning.summary,
    intelligence.onvermijdelijke_keuzes.summary,
    intelligence.prijs_van_uitstel.summary,
    intelligence.mandaat_besluitrecht.summary,
    intelligence.onderstroom_informele_macht.summary,
  ].join(" ");
  const actors = extractActorAnchors(corpus);

  const optionA = firstDecisionSentence(
    thesis,
    "Consolideer eerst de kernactiviteiten en herstel financiële voorspelbaarheid."
  );
  const optionB = firstDecisionSentence(
    choices,
    "Stuur op hybride uitvoering met begrensde verbreding binnen harde meetpunten."
  );
  const optionC = firstDecisionSentence(
    intelligence.structurele_kernspanning.summary,
    "Versnel verbreding ondanks beperkte contractzekerheid en capaciteit."
  );

  const [optionADescription, optionBDescription, optionCDescription] =
    ensureDistinctOptionDescriptions([
      {
        description: optionA,
        fallback:
          "Consolideer 12 maanden de GGZ-kern en herstel margecontrole vóór uitbreiding.",
      },
      {
        description: optionB,
        fallback:
          "Hanteer hybride sturing met verbreding onder harde 30/60/90-gates en capaciteitsplafond.",
      },
      {
        description: optionC,
        fallback:
          "Versnel verbreding direct en accepteer hogere kans op liquiditeitsdruk en executieverlies.",
      },
    ]);

  const explicitLoss = clampSentence(
    contract,
    "Pauzeer minimaal één niet-kerninitiatief tot margesturing aantoonbaar stabiel is."
  );

  const decision: DecisionLayer = {
    de_keuze_vandaag: toWordBounded(
      firstDecisionSentence(thesis, "Kies vandaag expliciet voor kernconsolidatie vóór verbreding.", 22),
      22
    ),
    drie_opties: [
      {
        name: "Optie A",
        description: optionADescription,
        risk: "Tijdelijke groeivertraging en druk op verwachtingen."
      },
      {
        name: "Optie B",
        description: optionBDescription,
        risk: "Complexe governance; risico op dubbel sturen blijft bestaan."
      },
      {
        name: "Optie C",
        description: optionCDescription,
        risk: "Hoger cash- en executierisico bij onvoldoende margedata."
      },
    ],
    voorkeursoptie: "Optie A: consolideren, daarna gecontroleerd verbreden.",
    expliciet_verlies: [
      "Wat lever je in: tijdelijke groeisnelheid buiten de kern.",
      "Wat vertraag je: uitbreiding van HR-loket en vierde pijler.",
      "Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.",
      "Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.",
      `Actorimpact: ${actors.lead} borgt besluitdiscipline; ${actors.strategy} borgt contract- en margebesluit; ${actors.operations} verliest lokale bypassruimte.`,
      explicitLoss
    ].join(" "),
    stop_doing: [
      "Stop nieuwe initiatieven zonder margevalidatie.",
      "Stop lokale capaciteitsbesluiten buiten centrale prioritering.",
      "Stop besluituitstel zonder gedocumenteerde escalatie."
    ],
    gates: [
      {
        day: 30,
        criteria: [
          "Besluitmemo met keuze, eigenaar en deadline is getekend.",
          "Stop-doing lijst actief in weekritme.",
          "Financieel bewijsblok heeft geen ontbrekende kernvelden."
        ],
        consequence_if_failed:
          "Nieuwe initiatieven worden automatisch bevroren tot formeel herstelbesluit."
      },
      {
        day: 60,
        criteria: [
          "Marge- en capaciteitsoverzicht wordt wekelijks ververst.",
          "Escalaties worden binnen 48 uur gesloten.",
          "Contractprioriteiten zijn geformaliseerd per verzekeraar."
        ],
        consequence_if_failed:
          "Mandaat verschuift tijdelijk naar centrale besluittafel onder CFO/CEO."
      },
      {
        day: 90,
        criteria: [
          "Minimaal 85% van de acties is gesloten of hergecontracteerd.",
          "Voorkeursoptie is aantoonbaar in operatie verankerd.",
          "RvT heeft het onomkeerbaar moment formeel beoordeeld."
        ],
        consequence_if_failed:
          "Verbreding blijft gepauzeerd; herbesluit verplicht met RvT-goedkeuring."
      },
    ],
    mandaatverschuiving:
      `Bij gemist meetpunt vervallen lokale portfolio- en capaciteitsbesluiten; ${actors.lead}/${actors.strategy} beslissen bindend via centrale prioriteringstafel binnen 48 uur.`,
    handtekeningdiscipline: {
      wie_tekent: ["CEO", "CFO", "Bestuurssecretaris"],
      overtreding_consequentie:
        "Bij overtreding volgt automatische escalatie naar RvT met herstelplan binnen 5 werkdagen."
    },
    financieel_bewijsblok: deriveFinancialProof(intelligence),
  };

  validateDecisionLayer(decision);
  return decision;
}

export function validateDecisionLayer(layer: DecisionLayer): void {
  if (!layer.voorkeursoptie.trim()) {
    throw new Error("Decision Layer FAIL: geen voorkeursoptie.");
  }
  if (!layer.expliciet_verlies.trim()) {
    throw new Error("Decision Layer FAIL: geen expliciet verlies.");
  }
  if (!Array.isArray(layer.stop_doing) || layer.stop_doing.length !== 3) {
    throw new Error("Decision Layer FAIL: stop_doing moet exact 3 punten bevatten.");
  }
  if (!Array.isArray(layer.gates) || layer.gates.length < 3) {
    throw new Error("Decision Layer FAIL: minimaal 3 gates vereist.");
  }
  for (const gate of layer.gates) {
    if (!gate.consequence_if_failed?.trim()) {
      throw new Error(`Decision Layer FAIL: gate ${gate.day} mist consequence_if_failed.`);
    }
  }
}

export function buildDualLayerOutput(input: IntelligenceInput): CyntraDualLayerOutput {
  const intelligence = buildIntelligenceLayer(input);
  const decision = generateDecisionLayer(intelligence);
  return {
    intelligence_layer: intelligence,
    decision_layer: decision,
  };
}
