const REQUIRED_SECTIONS = [
  "1. Dominante These",
  "2. Structurele Kernspanning",
  "3. Keerzijde van de keuze",
  "4. De Prijs van Uitstel",
  "5. Mandaat & Besluitrecht",
  "6. Onderstroom & Informele Macht",
  "7. Faalmechanisme",
  "8. 90-Dagen Interventieontwerp",
  "9. Besluitkader",
];

export function validateStrictStructure(text: string) {
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) {
      throw new Error(`STRUCTURE LOCK: Missing section -> ${section}`);
    }
  }
}
