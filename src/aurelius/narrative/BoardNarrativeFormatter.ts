export function formatBoardNarrative(inputText: string): string {
  const source = String(inputText ?? "").replace(/\r\n/g, "\n").trim();
  if (!source) return "";

  const paragraphs = source
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(limitParagraphSentences)
    .filter(Boolean);

  const deduped = dedupeParagraphs(paragraphs);
  return deduped.join("\n\n").trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function limitParagraphSentences(paragraph: string): string {
  const sentences = splitSentences(paragraph);
  if (sentences.length <= 5) return paragraph;
  return sentences.slice(0, 5).join(" ").trim();
}

function dedupeParagraphs(paragraphs: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const paragraph of paragraphs) {
    const normalized = paragraph.toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(paragraph);
  }
  return result;
}
