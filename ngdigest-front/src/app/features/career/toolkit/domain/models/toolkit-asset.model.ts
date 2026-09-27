// by project-worker 2026-08-21
import { LocalizedText } from '@shared/models/localized-text';

/**
 * The /carriere/toolkit page hands out the assets you fill in *before* applying:
 * resume templates, application/follow-up emails and interview prep sheets.
 *
 * Distinct from /carriere/formations (external training), /carriere/certifications
 * (exams) and /carriere/entretien (the 69 Q/A to revise): here everything is a file
 * you download, edit and send.
 *
 * Assets are plain Markdown on purpose — editable in any editor, diff-able, and
 * convertible to PDF/DOCX by whoever downloads them. No binary blobs in the repo.
 * Pure domain model — no Angular imports.
 */
export type ToolkitCategory = 'cv' | 'lettres' | 'prep';

export type ToolkitFormat = 'markdown';

export interface ToolkitFile {
  readonly lang: 'fr' | 'en';
  /** Public path served from `public/`, e.g. `/assets/toolkit/cv-angular-fr.md`. */
  readonly path: string;
  readonly format: ToolkitFormat;
}

export interface ToolkitAsset {
  readonly id: string;
  readonly category: ToolkitCategory;
  readonly title: LocalizedText;
  /** One-line "what it is / when you use it". */
  readonly blurb: LocalizedText;
  /** 2-3 concrete things the file contains — what makes it worth downloading. */
  readonly highlights: readonly LocalizedText[];
  /** How long it realistically takes to fill in, e.g. "30 min". */
  readonly effort: LocalizedText;
  /** One file per language. */
  readonly files: readonly ToolkitFile[];
  /** ISO date of the last editorial revision (shown on the card). */
  readonly updated: string;
}

/** Returns the downloadable file for a language, or `null` when not translated yet. */
export function fileForLang(asset: ToolkitAsset, lang: 'fr' | 'en'): ToolkitFile | null {
  return asset.files.find((file) => file.lang === lang) ?? null;
}
