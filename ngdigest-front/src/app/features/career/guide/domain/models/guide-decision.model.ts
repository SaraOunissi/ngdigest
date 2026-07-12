import { LocalizedText } from '@shared/models/localized-text';

/**
 * A career sub-page an outcome can point to. Kept as a semantic key so the
 * presentation layer resolves the actual localized route (FR/EN slugs).
 */
export type GuideLinkTarget = 'formations' | 'plateformes' | 'entretien' | 'certifications';

/** One call-to-action shown at the end of a decision branch. */
export interface GuideLink {
  readonly target: GuideLinkTarget;
  /** i18n chrome key for the link label. */
  readonly labelKey: string;
}

/** The advice shown once a branch of the decision tree is fully answered. */
export interface GuideOutcome {
  readonly id: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly links: readonly GuideLink[];
}

/** A selectable answer within a decision-tree question. */
export interface GuideOption {
  readonly id: string;
  readonly label: LocalizedText;
  /** Short pros/cons note revealed once the option is picked. */
  readonly hint?: LocalizedText;
  /** Id of the next question, or `null` when the option leads to an outcome. */
  readonly next: string | null;
  /** Id of the outcome to show when this option is a leaf. */
  readonly outcome?: string;
}

/** One question node of the "orient yourself in 3 questions" decision tree. */
export interface GuideQuestion {
  readonly id: string;
  /** Mono step label used in the answered-path recap (e.g. "Statut"). */
  readonly stepLabel: LocalizedText;
  readonly title: LocalizedText;
  readonly options: readonly GuideOption[];
}

/** The full decision tree: an ordered set of questions + reachable outcomes. */
export interface GuideDecisionTree {
  readonly rootId: string;
  readonly questions: readonly GuideQuestion[];
  readonly outcomes: readonly GuideOutcome[];
}
