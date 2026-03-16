export type StakeholderAdoptionInput = {
  interventionText: string;
  boardroomText: string;
};

export type StakeholderAdoption = {
  intervention: string;
  stakeholders: string;
  mustAdopt: string;
  canBlock: string;
  canAccelerate: string;
};

function splitInterventions(interventionText: string): string[] {
  const blocks = String(interventionText ?? "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .filter((b) => /(actie|interventie|maand\s*[123]|eigenaar|kpi)/i.test(b));
  return blocks.slice(0, 6);
}

export function buildStakeholderAdoptionModel(
  input: StakeholderAdoptionInput
): StakeholderAdoption[] {
  const interventions = splitInterventions(input.interventionText);
  const boardroom = String(input.boardroomText ?? "").toLowerCase();
  const blockers = boardroom.includes("informele invloed")
    ? "Informele beïnvloeders rond planning en uitzonderingsroutes"
    : "Lokale besluitnemers met afwijkende prioriteiten";

  return interventions.map((block, idx) => ({
    intervention: `Interventie ${idx + 1}: ${block.slice(0, 120)}`,
    stakeholders: "Bestuur, management, operations, HR en behandel-/uitvoeringsteams",
    mustAdopt: "CEO/COO/CFO plus lijnverantwoordelijken en teamcoördinatoren",
    canBlock: blockers,
    canAccelerate: "Centrale prioriteringstafel, duidelijke owners en snelle escalatieroutes",
  }));
}
