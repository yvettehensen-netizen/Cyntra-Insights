export function calculateOrganisatieFrictieScore(input: {
  narrativeText: string;
  context: string;
}): {
  score: number;
  conflictMentions: number;
  powerConflicts: number;
  mandateDiffusionMentions: number;
  delayMentions: number;
  sabotagePatterns: number;
  contextHasTensionSignals: boolean;
} {
  const narrative = String(input.narrativeText ?? "");
  const context = String(input.context ?? "");

  const conflictMentions = (narrative.match(/\b(conflict|tegenstrijdig belang|frictie|botsing)\b/gi) ?? []).length;
  const powerConflicts = (narrative.match(/\b(machtsconflict|besluitrecht verschuift|mandaatconflict|gatekeeping|stil veto)\b/gi) ?? []).length;
  const mandateDiffusionMentions = (narrative.match(/\b(dubbel mandaat|diffuus mandaat|onduidelijk eigenaarschap|niemand beslist)\b/gi) ?? []).length;
  const delayMentions = (narrative.match(/\b(vertraging|uitstel|wachttijd|stroperig)\b/gi) ?? []).length;
  const sabotagePatterns = (narrative.match(/\b(sabotage|bypass|informele bypass|stil veto|ondermijning)\b/gi) ?? []).length;

  const raw =
    conflictMentions * 10 +
    powerConflicts * 15 +
    mandateDiffusionMentions * 10 +
    delayMentions * 5 +
    sabotagePatterns * 10;
  const score = Math.min(100, raw);

  const contextHasTensionSignals =
    /\b(conflict|wachttijd|druk|frictie|escalatie|vertraging|mandaat|tegenstrijdig)\b/i.test(context);

  return {
    score,
    conflictMentions,
    powerConflicts,
    mandateDiffusionMentions,
    delayMentions,
    sabotagePatterns,
    contextHasTensionSignals,
  };
}
