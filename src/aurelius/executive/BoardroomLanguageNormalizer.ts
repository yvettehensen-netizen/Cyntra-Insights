function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ensureSentence(value: string): string {
  const text = normalize(value).replace(/\s+([.,;:!?])/g, "$1");
  if (!text) return "";
  return /[.!?…:]$/.test(text) ? text : `${text}.`;
}

function sharpenPhrases(value: string): string {
  return normalize(value)
    .replace(/\bontstaat doordat\b/gi, "komt doordat")
    .replace(/\bomdat de huidige besturing kostenstijging en opbrengstdruk niet gelijktijdig opvangt\b/gi, "bestuur kosten- en opbrengstdruk niet tegelijk stuurt")
    .replace(/\bMarktbeperkingen zijn deels impliciet en vragen expliciete validatie\b/gi, "de contractgrens impliciet blijft")
    .replace(/\bParallelle ambities zonder volgorde vergroten uitvoeringsverlies\b/gi, "Parallelle ambities zonder volgorde vergroten uitvoeringsverlies")
    .replace(/\bGovernancefrictie vertaalt zich direct naar besluitvertraging\b/gi, "Governancefrictie vertraagt besluiten direct")
    .replace(/\bContractplafonds en tariefdruk begrenzen schaalbaarheid\b/gi, "Contractplafonds en tariefdruk begrenzen de schaalruimte")
    .replace(/\bMeer professionals of meer productie vertaalt zich direct in meer bestuurlijk houdbare capaciteit\b/gi, "Meer professionals leveren niet automatisch bestuurlijk houdbare capaciteit op")
    .replace(/\bNog geen directe vergelijkcases beschikbaar; basispatroon is\b/gi, "Nog geen directe vergelijkcases beschikbaar. Basispatroon:")
    .replace(/\bHuidige richting is\b/gi, "Huidige richting:")
    .replace(/\bWaarschuwing:\s*zonder historisch vergelijkmateriaal moet de gekozen richting sneller worden gevalideerd via expliciete KPI- en stopregels\b/gi, "Waarschuwing: valideer deze richting vroeg met KPI's en stopregels")
    .replace(/\bImplicatie:\s*/gi, "")
    .replace(/\bMechanisme:\s*/gi, "")
    .trim();
}

export function normalizeBoardroomSentence(value: string, maxChars = 220): string {
  let text = sharpenPhrases(value)
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.\s*\./g, ".")
    .trim();

  text = text.replace(/(.{1,220}?)\s+(komt doordat|omdat)\s+/i, (_match, first, connector) => {
    const lead = ensureSentence(first);
    const bridge = /komt doordat/i.test(connector) ? "Oorzaak:" : "Reden:";
    return `${lead} ${bridge} `;
  });

  if (text.length > maxChars) {
    text = `${text.slice(0, maxChars - 1).trimEnd()}…`;
  }
  return ensureSentence(text);
}

export function normalizeBoardroomBullet(value: string, maxChars = 220): string {
  const text = normalizeBoardroomSentence(
    normalize(value).replace(/^(?:•|-|\d+\.)\s*/, ""),
    maxChars
  );
  return text.replace(/^([a-zà-ÿ])/i, (char) => char.toUpperCase());
}

export function frameBoardroomShock(value: string, maxChars = 180): string {
  const text = normalize(value)
    .replace(/\bkomt doordat\b/gi, "omdat")
    .replace(/\bwaardoor\b/gi, "Daardoor")
    .replace(/\bde organisatie\b/gi, "Deze organisatie")
    .replace(/\bbestuur\b/gi, "Het bestuur")
    .trim();

  if (!text) return "";

  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => normalize(part))
    .filter(Boolean);
  const lead = parts[0] || text;
  let framed = lead
    .replace(/\bContractplafonds en tariefdruk begrenzen de schaalruimte\b/i, "De schaalgrens ligt niet bij capaciteit maar bij contractruimte")
    .replace(/\bMeer professionals leveren niet automatisch bestuurlijk houdbare capaciteit op\b/i, "Meer professionals lossen het kernprobleem niet op")
    .replace(/\bGovernancefrictie vertraagt besluiten direct\b/i, "Besluitvertraging is hier geen bijzaak maar het probleem zelf")
    .replace(/\bParallelle ambities zonder volgorde vergroten uitvoeringsverlies\b/i, "Zonder prioriteitskeuze verliest de organisatie uitvoeringskracht")
    .replace(/\bNog geen directe vergelijkcases beschikbaar\. Basispatroon:\b/i, "Zonder vergelijkcases is snelle validatie verplicht:")
    .replace(/\bHuidige richting:\b/i, "Bestuurlijke keuze:")
    .trim();

  if (!/[.!?]$/.test(framed)) framed = `${framed}.`;
  if (framed.length > maxChars) framed = `${framed.slice(0, maxChars - 1).trimEnd()}…`;
  return framed;
}

export function compactBoardroomBody(
  value: string,
  options?: {
    maxParagraphs?: number;
    maxCharsPerParagraph?: number;
  }
): string {
  const maxParagraphs = options?.maxParagraphs ?? 2;
  const maxCharsPerParagraph = options?.maxCharsPerParagraph ?? 360;
  const paragraphs = String(value || "")
    .split(/\n\s*\n/g)
    .map((part) => normalize(part))
    .filter(Boolean)
    .slice(0, maxParagraphs)
    .map((part) => normalizeBoardroomSentence(part, maxCharsPerParagraph));
  return paragraphs.join("\n\n").trim();
}
