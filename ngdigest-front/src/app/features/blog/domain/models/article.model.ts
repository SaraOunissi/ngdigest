/** A single entry of an article's table of contents (built from `##` headings). */
export interface TocEntry {
  readonly id: string;
  readonly text: string;
}

/** Big editorial figure used on the "featured" card placeholder visual. */
export interface ArticleHighlight {
  readonly value: string;
  readonly label: string;
}

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
  /** Estimated reading time in minutes (computed at build time). */
  readonly readingMinutes: number;
  /** Table of contents extracted from the `##` headings. */
  readonly toc: readonly TocEntry[];
  /** Cover image path, or null to fall back to the striped placeholder. */
  readonly cover: string | null;
  /** Big editorial figure for the featured-card placeholder, or null. */
  readonly highlight: ArticleHighlight | null;
  /** When true, pins this article as the featured one on the blog list. */
  readonly featured: boolean;
}
