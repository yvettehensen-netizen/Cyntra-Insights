export type InterventionRealityResult = {
  averageScore: number;
  interventionCount: number;
  invalidInterventions: number;
};

function section7(text: string): string {
  const source = String(text ?? "");
  const match = source.match(/###\s*7\.\s*[^\n]+([\s\S]*?)(?=^###\s*8\.)/im);
  return match?.[1] ?? "";
}

export function calculateInterventieRealiteitScore(text: string, anchors: string[]): InterventionRealityResult {
  const section = section7(text);
  const blocks = section.split(/(?=\bActie:)/g).map((s) => s.trim()).filter(Boolean);
  if (!blocks.length) {
    return { averageScore: 0, interventionCount: 0, invalidInterventions: 0 };
  }

  let sum = 0;
  let invalid = 0;
  for (const block of blocks) {
    let score = 0;
    if (/Actie:\s*[A-Za-z].+/i.test(block)) score += 1;
    if (/Eigenaar:\s*[A-Za-z].+/i.test(block)) score += 1;
    if (/Deadline:\s*(Dag\s*\d+|\d{4}-\d{2}-\d{2})/i.test(block)) score += 1;
    if (/KPI:\s*[A-Za-z0-9].+/i.test(block)) score += 1;
    if (/Escalatiepad:\s*[A-Za-z].+/i.test(block)) score += 1;
    if (/Direct zichtbaar effect(?:\s*\(<=7 dagen\))?:\s*[A-Za-z0-9].+/i.test(block)) score += 1;
    if (
      anchors.some((anchor) =>
        block.toLowerCase().includes(String(anchor ?? "").toLowerCase())
      )
    ) {
      score += 1;
    }
    if (score < 5) invalid += 1;
    sum += score;
  }

  return {
    averageScore: Number((sum / blocks.length).toFixed(2)),
    interventionCount: blocks.length,
    invalidInterventions: invalid,
  };
}
