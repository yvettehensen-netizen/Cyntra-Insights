export type BoardroomSectionKey =
  | "dominante_these"
  | "kernspanning"
  | "keerzijde_keuze"
  | "prijs_uitstel"
  | "mandaat_besluitrecht"
  | "onderstroom_macht"
  | "faalmechanisme"
  | "interventieplan_90_dagen"
  | "besluitkader";

export type BoardroomStructureValidationResult = {
  pass: boolean;
  missing: BoardroomSectionKey[];
};

const SECTION_PATTERNS: Record<BoardroomSectionKey, RegExp[]> = {
  dominante_these: [/\bdominante\b.*\bthese\b/i, /\bdominante bestuurlijke these\b/i],
  kernspanning: [/\bstructurele kernspanning\b/i, /\bkernconflict\b/i, /\bkernspanning\b/i],
  keerzijde_keuze: [/\bkeerzijde\b.*\bkeuze\b/i, /\btrade-?offs?\b/i],
  prijs_uitstel: [/\bprijs\b.*\buitstel\b/i, /\bopportunity cost\b/i],
  mandaat_besluitrecht: [/\bmandaat\b/i, /\bbesluitrecht\b/i, /\bgovernance impact\b/i],
  onderstroom_macht: [/\bonderstroom\b/i, /\binformele macht\b/i, /\bmachtsdynamiek\b/i],
  faalmechanisme: [/\bfaalmechanisme\b/i, /\bexecutierisico\b/i],
  interventieplan_90_dagen: [/\b90[- ]dagen\b.*\binterventie/i, /\binterventieplan\b/i],
  besluitkader: [/\bbesluitkader\b/i, /\bdecision contract\b/i],
};

function normalize(text: string): string {
  return String(text ?? "").replace(/\r\n/g, "\n");
}

export function validateBoardroomReportStructure(text: string): BoardroomStructureValidationResult {
  const source = normalize(text);
  const missing = (Object.keys(SECTION_PATTERNS) as BoardroomSectionKey[]).filter((key) => {
    return !SECTION_PATTERNS[key].some((pattern) => pattern.test(source));
  });
  return {
    pass: missing.length === 0,
    missing,
  };
}

export function assertBoardroomReportStructure(text: string): void {
  const result = validateBoardroomReportStructure(text);
  if (!result.pass) {
    throw new Error(
      `Boardroom rapport geblokkeerd: ontbrekende secties: ${result.missing.join(", ")}`
    );
  }
}

