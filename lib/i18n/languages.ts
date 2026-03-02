export const LANGUAGES = ["en", "bn"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_COOKIE = "lang";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  bn: "বাংলা",
};

export function isValidLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

export function parseLanguage(value: unknown): Language {
  return isValidLanguage(value) ? value : DEFAULT_LANGUAGE;
}
