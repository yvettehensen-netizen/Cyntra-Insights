export interface StrategicEngineResult {
  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  confidence: number;
}

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function uniqueLines(values: Array<unknown>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const line = normalize(value);
    const key = line.toLowerCase();
    if (!line || seen.has(key)) continue;
    seen.add(key);
    output.push(line);
  }
  return output;
}

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(3));
}

