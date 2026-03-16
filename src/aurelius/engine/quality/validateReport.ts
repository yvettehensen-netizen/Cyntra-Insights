type ReportSections = {
  thesis: string;
  conflict: string;
  decision: string;
  boardQuestion: string;
  stressTest: string;
  killerInsights: string[];
  interventionActions: string[];
};

export type ReportQualityValidation = {
  sections: ReportSections;
  score: number;
  warnings: string[];
  gatePassed: boolean;
};

const FALLBACKS = {
  thesis: "Dominante these kon niet automatisch worden bepaald.",
  conflict: "Strategische spanning kon niet automatisch worden bepaald.",
  decision: "Bestuurlijke keuze kon niet automatisch worden bepaald.",
  boardQuestion: "Bestuurlijke vraag kon niet automatisch worden bepaald.",
  stressTest:
    "Boardroom stresstest kon niet automatisch worden bepaald. Zonder expliciete keuze neemt strategische frictie verder toe.",
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function extractSection(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) return normalize(match[1]);
    if (match?.[0]) return normalize(match[0]);
  }
  return "";
}

function extractListBlock(text: string, patterns: RegExp[]): string[] {
  const block = extractSection(text, patterns);
  if (!block) return [];
  return block
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function ensureMinItems(items: string[], minimum: number, fallbackPrefix: string): string[] {
  const unique = Array.from(new Set(items.map((item) => normalize(item)).filter(Boolean)));
  while (unique.length < minimum) {
    unique.push(`${fallbackPrefix} ${unique.length + 1}`);
  }
  return unique;
}

export function validateReport(reportText: string): ReportQualityValidation {
  const source = String(reportText ?? "");
  const thesis = extractSection(source, [
    /(?:^|\n)(?:###\s*)?(?:EXECUTIVE THESIS|DOMINANTE THESE|BESTUURLIJKE THESE)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    /(?:^|\n)2\.\s*(?:Executive Thesis|Bestuurlijke these)\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
  ]);
  const conflict = extractSection(source, [
    /(?:^|\n)(?:###\s*)?(?:STRATEGISCHE SPANNING|STRATEGISCH KERNCONFLICT|KERNCONFLICT)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    /(?:^|\n)3\.\s*(?:Strategische spanning|Kernconflict)\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
  ]);
  const decision = extractSection(source, [
    /(?:^|\n)(?:###\s*)?(?:BESTUURLIJKE KEUZE|AANBEVOLEN KEUZE|BESLUITVOORSTEL)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    /(?:^|\n)5\.\s*(?:Aanbevolen keuze|Bestuurlijke keuze)\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
  ]);
  const boardQuestion = extractSection(source, [
    /(?:^|\n)(?:###\s*)?(?:BESTUURLIJKE VRAAG|BOARDROOM QUESTION|BOARD VRAAG)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    /(?:^|\n)1\.\s*Besluitvraag\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
  ]);
  const stressTest = extractSection(source, [
    /(?:^|\n)(?:###\s*)?(?:BOARDROOM STRESSTEST|STRESSTEST|DE PRIJS VAN UITSTEL)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    /(?:^|\n)9\.\s*Boardroom stresstest\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
  ]);

  const killerInsights = ensureMinItems(
    extractListBlock(source, [
      /(?:^|\n)(?:###\s*)?(?:KILLER INSIGHTS|NIEUWE INZICHTEN)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
    ]),
    5,
    "Killer insight ontbreekt"
  );
  const interventionActions = ensureMinItems(
    extractListBlock(source, [
      /(?:^|\n)(?:###\s*)?(?:90-DAGEN INTERVENTIEPLAN|90-DAGEN INTERVENTIEONTWERP|INTERVENTIES)\s*\n([\s\S]*?)(?=\n(?:###|\d+\.)|\s*$)/i,
      /(?:^|\n)7\.\s*90-dagen interventieplan\s*\n([\s\S]*?)(?=\n\d+\.|\s*$)/i,
    ]),
    10,
    "Interventie ontbreekt"
  );

  const warnings: string[] = [];
  if (!thesis) warnings.push("missing_thesis");
  if (!conflict) warnings.push("missing_conflict");
  if (!decision) warnings.push("missing_decision");
  if (!boardQuestion) warnings.push("missing_board_question");
  if (!stressTest) warnings.push("missing_stress_test");
  if (killerInsights.filter((item) => !/^Killer insight ontbreekt/.test(item)).length < 5) warnings.push("insufficient_killer_insights");
  if (interventionActions.filter((item) => !/^Interventie ontbreekt/.test(item)).length < 10) warnings.push("insufficient_intervention_plan");

  const completedChecks = 7 - warnings.length;
  const score = completedChecks === 7 ? 100 : Math.max(70, completedChecks * 12 + 16);

  return {
    sections: {
      thesis: thesis || FALLBACKS.thesis,
      conflict: conflict || FALLBACKS.conflict,
      decision: decision || FALLBACKS.decision,
      boardQuestion: boardQuestion || FALLBACKS.boardQuestion,
      stressTest: stressTest || FALLBACKS.stressTest,
      killerInsights,
      interventionActions,
    },
    score,
    warnings,
    gatePassed: warnings.length === 0,
  };
}
