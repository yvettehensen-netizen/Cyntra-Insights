export type BoardEditorialPromptInput = {
  organisation?: string;
  sector?: string;
};

export function buildBoardEditorialPrompt(input: BoardEditorialPromptInput): string {
  return [
    "EDITORIAL PROMPT",
    "ROL",
    "Je bent hoofdredacteur van een bestuursrapport.",
    "",
    "DOEL",
    "Maak van de analyse een helder en professioneel rapport.",
    "",
    "INSTRUCTIES",
    "Gebruik als input: strategische spanning, systeemmechanisme, breukpunten, keuze en interventies.",
    "",
    "REGELS",
    "- gebruik geen interne labels",
    "- gebruik geen Engelse consultancywoorden",
    "- gebruik geen halve zinnen",
    "- vermijd herhaling",
    "- gebruik exact één dominante these in het hele rapport",
    "- formuleer de dominante these in maximaal 25 woorden",
    "- maximaal één kernidee per alinea",
    "- maximaal 20 woorden per zin",
    "- elke sectie moet zelfstandig begrijpelijk zijn",
    "- elke sectie moet nieuwe informatiewaarde toevoegen",
    "- onderbouw de aanbevolen keuze met 3 tot 5 concrete bronankers",
    "- neem geen ruwe transcriptblokken of bronbullets over in het hoofdrapport",
    "- vervang procesplaceholder-taal door echte bestuurlijke besluiten",
    '- schrijf "Het bestuur besluit ..." in plaats van "Laat het bestuur besluiten hoe..."',
    "- vermijd deze woorden tenzij direct concreet gemaakt: balans, complexiteit, dynamiek, uitdaging, situatie, ontwikkeling",
    "- maximale rapportlengte: 8 pagina's",
    "- bestuurlijke samenvatting bevat maximaal 6 regels",
    "- strategisch speelveld bevat exact 3 blokken: zorginhoud, contractlogica, capaciteit",
    "- doorbraakinzichten bevat exact 5 inzichten",
    "- het actieplan bevat maximaal 3 acties",
    "- scenario's bevat exact 3 opties",
    "- bestuurlijke stresstest bevat exact 3 vragen",
    "- elk rapport bevat minimaal 3 stopregels",
    "",
    `Organisatie: ${input.organisation || "onbekend"}`,
    `Sector: ${input.sector || "onbekend"}`,
    "",
    "STRUCTUUR",
    "1. Bestuurlijke besliskaart",
    "2. Bestuurlijke kernsamenvatting",
    "3. Strategisch speelveld",
    "4. Doorbraakinzichten",
    "5. Strategische breukpunten",
    "6. Bestuurlijk actieplan",
    "7. Scenario's",
    "8. Bestuurlijke stresstest",
  ].join("\n");
}

export function validateBoardEditorialOutput(text: string): string[] {
  const issues: string[] = [];
  if (/\b(prompt|input|output|token)\b/i.test(String(text ?? ""))) issues.push("Eindredactie bevat prompt-taal.");
  if (/\bKeuzedruk|HARD -|bron:|Kopieer richting\b/i.test(String(text ?? ""))) issues.push("Eindredactie bevat verboden artefacten.");
  if (/\bSamenvatting gesprekverslag|ACTION ITEMS|BLOCKERS|FYI\b/i.test(String(text ?? ""))) issues.push("Eindredactie bevat ruwe bronblokken.");
  if (/Laat het bestuur besluiten hoe/i.test(String(text ?? ""))) issues.push("Eindredactie bevat placeholder-besluittaal.");
  if (/\bbalans|complexiteit|dynamiek|uitdaging|situatie|ontwikkeling\b/i.test(String(text ?? ""))) issues.push("Eindredactie bevat generieke managementtaal.");
  return issues;
}
