const FORBIDDEN_PATTERNS = [
  /\bKeuzedruk\b/i,
  /\bHARD\s*-/i,
  /\bbron:\b/i,
  /\bKopieer richting\b/i,
  /\bOption placeholder\b/i,
  /\bOUTPUT\s*\d+\b/i,
  /\bCONTEXT LAYER\b/i,
  /\bSTRATEGIC CONFLICT\b/i,
  /\bSTRATEGY SIMULATION\b/i,
  /\bDECISION MEMORY\b/i,
];

export function noPromptLeakage(text: string): { pass: boolean; matches: string[] } {
  const matches = FORBIDDEN_PATTERNS.map((pattern) => text.match(pattern)?.[0]).filter(Boolean) as string[];
  return {
    pass: matches.length === 0,
    matches,
  };
}
