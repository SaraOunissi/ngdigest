/**
 * Represents a job posting loaded from a Markdown file at build time.
 * This is a pure domain model — no Angular imports.
 *
 * One file per offer in src/content/jobs/, parsed by
 * scripts/generate-jobs-data.mjs into jobs-data.generated.ts.
 */
export type JobType = 'CDI' | 'Freelance';
export type JobRemote = '100' | 'hybride' | 'onsite';
export type JobZone = 'FR' | 'EU' | 'Worldwide';
export type JobLanguage = 'fr' | 'en';
export type JobStatus = 'active' | 'expired';

export interface Job {
  readonly slug: string;
  readonly title: string;
  readonly company: string;
  readonly companyLogo: string;
  readonly type: JobType;
  readonly remote: JobRemote;
  readonly zone: JobZone;
  /** Free-form human-readable location, e.g. "Paris", "Paris / Berlin", "France".
   *  Null when irrelevant (e.g. fully remote without anchor city). */
  readonly location: string | null;
  readonly language: JobLanguage;
  /** Salary expressed in human-readable format, e.g. "65k-90k€". Null when freelance. */
  readonly salary: string | null;
  /** Daily rate (Taux Journalier Moyen), e.g. "550-650€/j". Null when CDI. */
  readonly tjm: string | null;
  readonly stack: readonly string[];
  /** External application URL. */
  readonly url: string;
  /** ISO date string when the job was last reviewed by Sara, e.g. "2026-05-16". */
  readonly scannedAt: string;
  readonly status: JobStatus;
  readonly tags: readonly string[];
  /** Short editorial hook displayed on the list card. */
  readonly editorialHook: string;
  /** Full editorial note (verbatim from the bi-monthly pépites). */
  readonly editorialNote: string;
}
