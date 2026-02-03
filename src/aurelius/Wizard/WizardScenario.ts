import { WizardAgent } from "./WizardAgent";

export class WizardScenario {
  agents: WizardAgent[];

  constructor() {
    this.agents = [
      new WizardAgent("Cassius", "strategie & positionering"),
      new WizardAgent("Livia", "financiën & cashflow"),
      new WizardAgent("Silvan", "teamdynamiek & leiderschap"),
      new WizardAgent("Marcellus", "operational excellence"),
      new WizardAgent("Varia", "markt & competitie"),
      new WizardAgent("Rex", "onderstroom & cultuur"),
      new WizardAgent("Octavia", "veranderkracht"),
    ];
  }

  async runDebate(input: string) {
    const messages = [];

    for (const agent of this.agents) {
      const perspective = await agent.think(input);

      messages.push({
        agent: agent.name,
        specialty: agent.specialty,
        perspective,
      });
    }

    return messages;
  }
}
