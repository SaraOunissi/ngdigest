/**
 * Represents a blog article loaded from a Markdown file at build time.
 * This is a pure domain model — no Angular imports.
 */
export interface Article {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** ISO date string, e.g. "2026-03-26" */
  readonly date: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly lang: 'fr' | 'en';
  /** Slug of the same article in the other language. */
  readonly alternate: string;
  /** Pre-rendered HTML content (generated at build time). */
  readonly contentHtml: string;
}
