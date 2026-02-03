export type Language = "nl" | "en";

export function enforceLanguagePrompt(language: Language): string {
  return language === "nl"
    ? "Schrijf uitsluitend in het Nederlands. Nooit Engels gebruiken."
    : "Write exclusively in English. Never use Dutch.";
}
