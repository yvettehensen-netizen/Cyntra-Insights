export type BoardroomIntelligenceNodeInput = {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
  orgDynamicsEngineOutput: string;
};

export function buildBoardroomIntelligenceNodePrompt(
  params: BoardroomIntelligenceNodeInput
): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

ORGANISATIEDYNAMIEK:
${params.orgDynamicsEngineOutput || "Niet beschikbaar; leid dynamiek af uit primaire broncontext."}

INSTRUCTIE:
Analyseer boardroom-intelligentie op macht, belangen, besluitdynamiek, informele structuren,
verborgen conflicten en leiderschapsdynamiek.

OUTPUT (EXACTE KOPPEN):
MACHTSSTRUCTUUR
WIE HEEFT BESLUITMACHT
WIE HEEFT INFORMELE INVLOED
WAAR ZIT DE FEITELIJKE MACHT
BELANGENSPANNING
WELKE BELANGEN BOTSTEN
WAT STAAT ER VOOR ELKE PARTIJ OP HET SPEL
BESLUITDYNAMIEK
GEDRAGSPATROON
STRATEGISCHE CONSEQUENTIE
VERBORGEN SPANNING
WAAROM DIT NIET WORDT UITGESPROKEN
WAT HET RISICO IS
LEIDERSCHAPSDYNAMIEK
WELKE BESLISSINGEN BIJ WIE LIGGEN
WAAR MANDATEN ONDUIDELIJK ZIJN

Minimaal 3 keer herhalen in exact format:
BOARDROOM INZICHT
WAAROM DIT BESTUURLIJK BELANGRIJK IS
RISICO ALS DIT NIET WORDT GEADRESSEERD
`.trim();
}

export function hasMinimumBoardroomInsights(text: string): boolean {
  const source = String(text ?? "");
  const insights = (source.match(/\bBOARDROOM\s+INZICHT\b/gi) ?? []).length;
  const why = (source.match(/\bWAAROM\s+DIT\s+BESTUURLIJK\s+BELANGRIJK\s+IS\b/gi) ?? []).length;
  const risk = (source.match(/\bRISICO\s+ALS\s+DIT\s+NIET\s+WORDT\s+GEADRESSEERD\b/gi) ?? []).length;
  return insights >= 3 && why >= 3 && risk >= 3;
}
