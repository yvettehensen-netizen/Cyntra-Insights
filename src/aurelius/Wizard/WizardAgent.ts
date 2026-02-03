export interface WizardMessage {
  role: "system" | "assistant" | "user";
  content: string;
}

export class WizardAgent {
  name: string;
  specialty: string;

  constructor(name: string, specialty: string) {
    this.name = name;
    this.specialty = specialty;
  }

  async think(input: string): Promise<string> {
    return `
${this.name} (${this.specialty}) perspectief:

${input}

Kernpunten:
- Analyseer dit vanuit ${this.specialty}
- Benoem risico's, kansen, patronen
- Geef 1 scherpe aanbeveling

Einde perspectief.
`;
  }
}
