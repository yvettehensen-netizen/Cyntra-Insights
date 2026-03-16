const FRAGMENT_ENDINGS = [
  /\blaagste directe\b/i,
  /\bverschuift strategisch\b/i,
  /\bdaalt o\b/i,
  /\bzodra\b/i,
  /\benz\.\b/i,
];

const ALLOWED_COMPLETE_LINES = [
  /^Strategisch patroon$/i,
];

export function noFragmentEndings(text: string): { pass: boolean; matches: string[] } {
  const lines = String(text ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  const matches = lines.filter(
    (line) =>
      !ALLOWED_COMPLETE_LINES.some((pattern) => pattern.test(line)) &&
      FRAGMENT_ENDINGS.some((pattern) => pattern.test(line))
  );
  return {
    pass: matches.length === 0,
    matches,
  };
}
