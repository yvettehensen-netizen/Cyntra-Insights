export function humanExecutiveCompress(text: string): string {
  let output = String(text ?? "");

  output = output.replace(/\n\s*\n\s*\n/g, "\n\n");

  const paragraphs = output.split("\n\n");
  const unique = new Set<string>();
  const filtered: string[] = [];

  for (const paragraph of paragraphs) {
    const normalized = paragraph.trim().toLowerCase();
    if (!normalized) continue;
    if (!unique.has(normalized)) {
      unique.add(normalized);
      filtered.push(paragraph);
    }
  }

  output = filtered.join("\n\n");
  output = output.replace(/trade-?offs?/gi, "verliesbesluit");

  output = output.replace(/([^\.]{180,}\.)/g, (match) =>
    match.replace(/, /g, ". ")
  );

  return output;
}

function normalizeFinancialTokens(text: string): string {
  let output = String(text ?? "");
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output.replace(
      /€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,
      (_full, head, sep, tail) => `€${head}${sep}${tail}`
    );
  }
  output = output.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g, "€$1$2$3");
  output = output.replace(/€\s+([0-9])/g, "€$1");
  return output;
}

export function enforceCausality(text: string): string {
  return String(text ?? "")
    .replace(/Dit betekent dat/gi, "Daardoor")
    .replace(/Hierdoor ontstaat/gi, "Dit leidt tot")
    .replace(/Het gevolg is dat/gi, "Gevolg:");
}

export function reorderHumanFirst(text: string): string {
  return String(text ?? "");
}

export function consolidateTimeBlocks(text: string): string {
  const seen = new Set<string>();
  return String(text ?? "")
    .split("\n")
    .filter((line) => {
      const key = line.trim();
      if (!key) return true;
      if (
        key.includes("30 dagen") ||
        key.includes("90 dagen") ||
        key.includes("365 dagen")
      ) {
        if (seen.has(key)) return false;
        seen.add(key);
      }
      return true;
    })
    .join("\n");
}

function clampSentenceLength(text: string): string {
  // Keep sentence integrity intact; hard chunking created artifacts like "circa. €16.833".
  return String(text ?? "").replace(/\s+\./g, ".").replace(/\.\./g, ".").trim();
}

function clampParagraphLines(text: string): string {
  return String(text ?? "")
    .split("\n\n")
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      if (lines.length <= 8) return paragraph;
      const merged = lines.join(" ").replace(/\s+/g, " ").trim();
      return merged;
    })
    .join("\n\n");
}

function dedupeSectionHeadings(text: string): string {
  const seen = new Set<string>();
  return String(text ?? "")
    .split("\n")
    .filter((line) => {
      const isHeading = /^\s*#{1,6}\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
      if (!isHeading) return true;
      const key = line.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

function ensureSectionConclusion(text: string): string {
  return String(text ?? "")
    .split("\n\n")
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return trimmed;
      if (/conclusie:|daarom|gevolg:/i.test(trimmed)) return trimmed;
      if (!/[.!?]$/.test(trimmed)) return `${trimmed}.`;
      return trimmed;
    })
    .join("\n\n");
}

function normalizeForDedupe(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s€%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeRepeatedParagraphs(text: string): string {
  const paragraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const paragraph of paragraphs) {
    const key = normalizeForDedupe(paragraph);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(paragraph);
  }
  return out.join("\n\n");
}

function dedupeRepeatedSentences(text: string): string {
  const paragraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const rewritten = paragraphs.map((paragraph) => {
    const sentences = (paragraph.match(/[^.!?\n]+[.!?]?/g) ?? [paragraph])
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const sentence of sentences) {
      const key = normalizeForDedupe(sentence);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(sentence);
    }
    return out.join(" ").replace(/\s+/g, " ").trim();
  });
  return rewritten.filter(Boolean).join("\n\n");
}

function cleanPunctuationArtifacts(text: string): string {
  return String(text ?? "")
    .replace(/\s+:\s+/g, ": ")
    .replace(/\s+;\s+/g, "; ")
    .replace(/\.\s*([,;:])/g, "$1")
    .replace(/\b(circa|ongeveer|rond|ca|en|maar|terwijl|of)\.\s+(€|\p{L})/giu, "$1 $2")
    .replace(/;\./g, ".")
    .replace(/\.\s*\./g, ".")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatHumanExecutiveText(text: string): string {
  let output = normalizeFinancialTokens(String(text ?? ""));
  output = reorderHumanFirst(output);
  output = humanExecutiveCompress(output);
  output = enforceCausality(output);
  output = consolidateTimeBlocks(output);
  output = dedupeSectionHeadings(output);
  output = clampSentenceLength(output);
  output = dedupeRepeatedSentences(output);
  output = dedupeRepeatedParagraphs(output);
  output = ensureSectionConclusion(output);
  return normalizeFinancialTokens(cleanPunctuationArtifacts(output));
}
