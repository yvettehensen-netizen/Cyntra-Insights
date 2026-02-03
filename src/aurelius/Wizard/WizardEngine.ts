import { WizardScenario } from "./WizardScenario";

export class WizardEngine {
  scenario: WizardScenario;

  constructor() {
    this.scenario = new WizardScenario();
  }

  async run(input: string) {
    const debate = await this.scenario.runDebate(input);

    return {
      debate,
      synthesis: `
SYNTHESIS DOOR AURELIUS:

Na beoordeling van alle perspectieven worden de volgende thema's dominant:

1. Strategie – gebrek aan prioriteiten
2. Finance – cashflowdruk zichtbaar
3. Team – verminderde energie & alignment
4. Operations – processen stroperig
5. Markt – positionering niet scherp
6. Onderstroom – psychologische veiligheid matig
7. Veranderkracht – tempo te laag

Aanbeveling:
- Kies 3 focusgebieden
- Zet 90-dagen executieteam op
- Wekelijks accountability-ritme
`,
      timestamp: new Date().toISOString(),
    };
  }
}
