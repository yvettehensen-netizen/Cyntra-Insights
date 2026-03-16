export function calculateBesluitdwangScore(text: string): {
  score: number;
  choiceMentions: number;
  irreversibilityMentions: number;
  lossMentions: number;
  contractCompleteness: number;
} {
  const source = String(text ?? "");
  const choiceMentions = (source.match(/\b(bestuur nu moet kiezen|het bestuur committeert|keuze:|beslismonopolie|besluitrecht)\b/gi) ?? []).length;
  const irreversibilityMentions = (source.match(/\b(point of no return|onomkeerbaar|irreversibel)\b/gi) ?? []).length;
  const lossMentions = (source.match(/\b(expliciet verlies|geaccepteerd verlies|accepted loss|verlies|inlevering|opoffering)\b/gi) ?? []).length;

  const section9 = source.match(/###\s*9\.\s*BESLUITKADER[\s\S]*$/i)?.[0] ?? "";
  const labels = [
    "Keuze:",
    "Expliciet verlies:",
    "Besluitrecht ligt bij:",
    "Stoppen per direct:",
    "Niet meer escaleren:",
    "Maandelijkse KPI:",
    "Failure trigger:",
    "Point of no return:",
    "Herijkingsmoment:",
  ];
  const presentLabels = labels.filter((label) => new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(section9)).length;
  const contractCompleteness = Math.round((presentLabels / labels.length) * 100);

  const weighted =
    Math.min(choiceMentions * 5, 35) +
    Math.min(irreversibilityMentions * 12, 25) +
    Math.min(lossMentions * 5, 20) +
    Math.min(contractCompleteness * 0.2, 20);

  return {
    score: Math.min(100, Math.round(weighted)),
    choiceMentions,
    irreversibilityMentions,
    lossMentions,
    contractCompleteness,
  };
}
