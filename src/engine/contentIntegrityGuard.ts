import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";

export type ContentIntegrityResult = {
  repairedText: string;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

const SUSPICIOUS_SUFFIX_PATTERNS = [
  /\bmarkeer\s+[a-z]\.$/i,
  /\bconsortium\s+of\s+[a-z]\.$/i,
  /\b(?:en|of|met|voor|naar|bij|van|op|uit|tot|via)\s+[a-z]{1,2}\.$/i,
];

const INLINE_TRUNCATION_PATTERNS = [
  /\bmarkeer\s+u\./gi,
  /\bconsortium\s+of\s+re\./gi,
];

const OPEN_END_PATTERNS = [
  /\bmarkeer\s+[a-z]{1,2}\.$/i,
  /\bconsortium\s+of\s+[a-z]{1,3}\.$/i,
];

function normalizeText(value: string): string {
  return sanitizeReportOutput(String(value || "")).replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function repairBrokenText(text: string): string {
  return normalizeText(text)
    .replace(/\bmarkeer\s+u\./gi, "markeer uitstapgemeenten expliciet.")
    .replace(/\bconsortium\s+of\s+re\./gi, "consortium of regio.")
    .replace(/\bcaseloadgrenzen\s+be\./gi, "caseloadgrenzen beter te bewaken.")
    .replace(/\bpartnerrol\s+en\s+caseloadgrenzen\s+be\./gi, "partnerrol en caseloadgrenzen beter te bewaken.")
    .replace(/\s+\.\s*$/g, ".")
    .trim();
}

export function validateContentIntegrity(text: string): string[] {
  const source = normalizeText(text);
  if (!source) return [];

  const errors = new Set<string>();
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (SUSPICIOUS_SUFFIX_PATTERNS.some((pattern) => pattern.test(line))) {
      errors.add("BROKEN_SENTENCE_DETECTED");
    }
    if (OPEN_END_PATTERNS.some((pattern) => pattern.test(line))) {
      errors.add("TRUNCATION_ARTIFACT");
    }
  }

  if (INLINE_TRUNCATION_PATTERNS.some((pattern) => pattern.test(source))) {
    errors.add("TRUNCATION_ARTIFACT");
  }

  const paragraphs = source.split(/\n\s*\n/g).map((part) => part.trim()).filter(Boolean);
  for (const paragraph of paragraphs) {
    if (paragraph.length > 120 && !/[.!?]$/.test(paragraph)) {
      errors.add("UNCLOSED_SENTENCE");
    }
  }

  return Array.from(errors);
}

export function ensureContentIntegrity(text: string, label = "content"): string {
  const repairedText = repairBrokenText(text);
  const errors = validateContentIntegrity(repairedText);
  if (errors.length) {
    const error = new Error(`INVALID_CONTENT_INTEGRITY: ${label}: ${errors.join(", ")}`);
    error.name = "INVALID_CONTENT_INTEGRITY";
    throw error;
  }
  return repairedText;
}

export function inspectContentIntegrity(text: string): ContentIntegrityResult {
  const repairedText = repairBrokenText(text);
  return {
    repairedText,
    errors: validateContentIntegrity(repairedText),
  };
}

export function validateEngineOutputIntegrity(payload: unknown): string[] {
  const errors = new Set<string>();

  const inspect = (value: unknown): void => {
    if (typeof value === "string") {
      validateContentIntegrity(value).forEach((error) => errors.add(error));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(inspect);
      return;
    }
    if (isRecord(value)) {
      Object.values(value).forEach(inspect);
    }
  };

  inspect(payload);
  return Array.from(errors);
}

export function assertEngineOutputIntegrity(payload: unknown, label = "engine_output"): void {
  const errors = validateEngineOutputIntegrity(payload);
  if (!errors.length) return;
  const error = new Error(`INVALID_CONTENT_INTEGRITY: ${label}: ${errors.join(", ")}`);
  error.name = "INVALID_CONTENT_INTEGRITY";
  throw error;
}
