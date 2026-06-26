import { LocalizedText } from '@shared/models/localized-text';

/** A macro-theme grouping interview questions. */
export interface InterviewTheme {
  readonly id: string;
  readonly label: LocalizedText;
}

export type InterviewDifficulty = 1 | 2 | 3;

/**
 * A single interview question with bilingual question & answer.
 * Answers carry light markdown (**bold**, `code`, *em*) and an optional
 * "💡" modern note, both rendered into the DOM (crawlable, not lazy JS).
 */
export interface InterviewQuestion {
  readonly id: string;
  readonly theme: string;
  /** Fine-grained sub-theme label (used for search). */
  readonly fine: string;
  readonly diff: InterviewDifficulty;
  /** Whether the answer reflects modern Angular 2026 (zoneless/signals…). */
  readonly modern: boolean;
  /** Senior-level seed question. */
  readonly seed: boolean;
  readonly q: LocalizedText;
  readonly a: LocalizedText;
}
