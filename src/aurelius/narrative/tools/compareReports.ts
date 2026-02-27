function normalize(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sentences(text: string): string[] {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  const union = new Set([...a, ...b]).size;
  return union ? shared / union : 0;
}

function section8Interventions(text: string): string[] {
  const m = String(text ?? "").match(/###\s*8\.[\s\S]*?(?=###\s*9\.)/i);
  if (!m) return [];
  return m[0]
    .split(/(?=\bActie:)/g)
    .map((x) => normalize(x))
    .filter(Boolean)
    .slice(0, 200);
}

export function compareReports(prev: string, next: string) {
  const prevTop = sentences(prev).slice(0, 10).map(normalize);
  const nextTop = sentences(next).slice(0, 10).map(normalize);
  const prevSet = new Set(prevTop);
  const overlapCount = nextTop.filter((s) => prevSet.has(s)).length;
  const top10Overlap = nextTop.length ? overlapCount / nextTop.length : 0;

  const tokenSetPrev = new Set(normalize(prev).split(" ").filter(Boolean));
  const tokenSetNext = new Set(normalize(next).split(" ").filter(Boolean));
  const jaccardScore = jaccard(tokenSetPrev, tokenSetNext);

  const interventions = section8Interventions(next);
  const uniqueInterventions = new Set(interventions).size;

  return {
    top10SentenceOverlap: top10Overlap,
    jaccard: jaccardScore,
    interventionCount: interventions.length,
    interventionUniqueness: interventions.length
      ? uniqueInterventions / interventions.length
      : 0,
  };
}
