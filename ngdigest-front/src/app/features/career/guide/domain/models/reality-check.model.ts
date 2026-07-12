import { LocalizedText } from '@shared/models/localized-text';

/** Bilingual multi-paragraph body. */
export interface RealityCheckBody {
  readonly fr: readonly string[];
  readonly en: readonly string[];
}

/** A cited primary source backing a data-based reality-check. */
export interface RealityCheckSource {
  /** Publisher + title + year — a citation, kept language-neutral. */
  readonly label: string;
  readonly url: string;
}

/**
 * One "market truth" — a short, opinionated reality-check shown as an
 * expandable card. Body paragraphs carry light markdown (**bold**), rendered
 * into the DOM so they stay crawlable. Data-backed checks also carry the
 * primary `sources` behind their figures.
 */
export interface RealityCheck {
  readonly id: string;
  readonly title: LocalizedText;
  readonly body: RealityCheckBody;
  readonly sources?: readonly RealityCheckSource[];
}
