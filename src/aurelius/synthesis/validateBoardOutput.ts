export type BoardGradeValidationResult = {
  pass: boolean;
  score: number;
  minScore: number;
  errors: string[];
  warnings: string[];
};

type ValidateBoardGradeOptions = {
  minScore?: number;
};

const CORE_SECTION_RULES: Array<{ id: string; patterns: RegExp[] }> = [
  {
    id: "dominante_these",
    patterns: [/\bDOMINANTE STRATEGISCHE THESE\b/i, /\bDominante These\b/i],
  },
  {
    id: "kernconflict",
    patterns: [
      /\bKERNCONFLICT\b/i,
      /\bKERNCONFLICT \(A\/B KEUZE\)\b/i,
      /\bStructurele Kernspanning\b/i,
    ],
  },
  {
    id: "machtsstructuur",
    patterns: [/\bMACHTSSTRUCTUUR\b/i, /\bOnderstroom\b/i, /\bMandaat\b/i],
  },
  {
    id: "case_structure",
    patterns: [/\bCASE STRUCTURE\b/i],
  },
  {
    id: "interventies",
    patterns: [/\bBOARD INTERVENTIES\b/i, /\b90-Dagen Interventie/i, /\bInterventieplan\b/i],
  },
  {
    id: "risico_niet_handelen",
    patterns: [/\bRISICO VAN NIET HANDELEN\b/i, /\bPrijs van Uitstel\b/i, /\bOpportunity Cost\b/i],
  },
  {
    id: "open_questions",
    patterns: [/\bOPEN QUESTIONS\b/i, /\bOpen vragen\b/i],
  },
];

function normalize(text: string): string {
  return String(text ?? "").replace(/\r\n/g, "\n");
}

function hasAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function sectionBody(source: string, headingPattern: RegExp): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\s*###\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function extractScore(result: Omit<BoardGradeValidationResult, "pass" | "score" | "minScore">): number {
  let score = 0;
  const text = `${result.errors.join(" ")} ${result.warnings.join(" ")}`;
  void text;

  // Structuur (25)
  const missingCore = result.errors.filter((error) => error.startsWith("missing_section:")).length;
  score += Math.max(0, 25 - missingCore * 5);

  // Conflictkwaliteit (20)
  if (!result.errors.includes("missing_conflict_choice")) score += 20;

  // Mechanistische inhoud (20)
  if (!result.errors.includes("missing_mechanistic_chains")) score += 20;
  else if (!result.warnings.includes("low_mechanistic_density")) score += 10;

  // Interventie-schaalbaarheid (20)
  if (!result.errors.includes("forbidden_operational_intervention")) score += 20;

  // Besluitdwang (15)
  if (!result.errors.includes("missing_decision_enforcement")) score += 15;

  return Math.max(0, Math.min(100, score));
}

export function validateBoardGradeOutput(
  text: string,
  options?: ValidateBoardGradeOptions
): BoardGradeValidationResult {
  const source = normalize(text);
  const errors: string[] = [];
  const warnings: string[] = [];
  const minScore = Number.isFinite(options?.minScore) ? Number(options?.minScore) : 85;

  for (const rule of CORE_SECTION_RULES) {
    if (!hasAnyPattern(source, rule.patterns)) {
      errors.push(`missing_section:${rule.id}`);
    }
  }

  const hasConflictChoice =
    /\bA:\s*.+/i.test(source) && /\bB:\s*.+/i.test(source) && /\b(BESLUIT|kies)\b/i.test(source);
  const hasConflictFallback = /\bversus\b/i.test(source) && /\bkernconflict|kernspanning\b/i.test(source);
  if (!hasConflictChoice && !hasConflictFallback) {
    errors.push("missing_conflict_choice");
  }

  const caseBody = sectionBody(source, /^\s*###\s*CASE STRUCTURE\b/i);
  if (caseBody) {
    const topicCount = (caseBody.match(/^\s*[-*]\s+/gm) ?? []).length;
    if (topicCount < 3 || topicCount > 5) {
      warnings.push("case_structure_topic_count_outside_3_5");
    }
  }

  const chainCount = (source.match(/->/g) ?? []).length;
  const causalCount = (source.match(/\b(waardoor|leidt tot|daardoor|resulteert in|omdat)\b/gi) ?? [])
    .length;
  if (chainCount + causalCount < 5) {
    errors.push("missing_mechanistic_chains");
    warnings.push("low_mechanistic_density");
  }

  const operationalInInterventions =
    /\b(training|workshop|meeting|procesverbetering)\b/i.test(
      sectionBody(source, /^\s*###\s*(BOARD INTERVENTIES|90-Dagen Interventieplan)\b/i) || source
    );
  if (operationalInInterventions) {
    errors.push("forbidden_operational_intervention");
  }

  const hasDecisionEnforcement =
    /\b(owner|eigenaar)\b/i.test(source) &&
    /\b(deadline|dag\s*30|binnen\s*\d+\s*dagen?)\b/i.test(source) &&
    /\b(kpi|meetbaar)\b/i.test(source) &&
    /\b(stopregel|escalatie)\b/i.test(source);
  if (!hasDecisionEnforcement) {
    errors.push("missing_decision_enforcement");
  }

  if (/\bmolendrift\b/i.test(source)) {
    const requiredAnchors = [
      /\b5\s*FTE\b/i,
      /\b70\/30\b/i,
      /\b8%\b/i,
      /\blicentie|netwerkmarge|netwerkopdrachten\b/i,
    ];
    for (const anchor of requiredAnchors) {
      if (!anchor.test(source)) errors.push("missing_molendrift_anchor");
    }
  }

  const partial: Omit<BoardGradeValidationResult, "pass" | "score" | "minScore"> = {
    errors,
    warnings,
  };
  const score = extractScore(partial);
  if (score < minScore) {
    errors.push(`score_below_threshold:${score}<${minScore}`);
  }

  return {
    pass: errors.length === 0,
    score,
    minScore,
    errors,
    warnings,
  };
}

export function assertBoardGradeOutput(text: string, options?: ValidateBoardGradeOptions): void {
  const result = validateBoardGradeOutput(text, options);
  if (!result.pass) {
    throw new Error(
      `Board-grade contract fail (score ${result.score}/${result.minScore}): ${result.errors.join(
        ", "
      )}`
    );
  }
}

