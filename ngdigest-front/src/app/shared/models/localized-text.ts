/**
 * A piece of editorial content available in both site languages.
 * Used by data models whose copy is authored bilingually
 * (catalog descriptions, certification verdicts, interview Q/A…).
 */
export interface LocalizedText {
  readonly fr: string;
  readonly en: string;
}

/** Returns the variant for the active language. */
export function pickLocalized(text: LocalizedText, lang: 'fr' | 'en'): string {
  return text[lang];
}
