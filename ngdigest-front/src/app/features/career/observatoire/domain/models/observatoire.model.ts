import { LocalizedText } from '@shared/models/localized-text';

/**
 * /carriere/observatoire — an editorial dashboard on the French front-end job
 * market. Each publish is a dated *snapshot* built only from public, sourced
 * figures (E-E-A-T). The types below are deliberately shaped as **time series**
 * so a live v2 (`ObservatoireHttpRepository`) can grow the `points` arrays and
 * flip `soon` blocks to published metrics without touching the presentation.
 *
 * Pure domain model — no Angular imports.
 * Source of truth: _drafts/observatoire-snapshots/SNAPSHOT-YYYY-MM.md.
 */

/** 🟢 shown with numbers vs 🚫 shown as a "coming soon / own data" block. */
export type MetricStatus = 'published' | 'soon';

/** The four chart shapes this snapshot renders (all as inline, SSR-safe SVG). */
export type ChartKind = 'bar' | 'hbar' | 'donut' | 'scissors';

/**
 * Semantic colour key for a chart mark. Resolved to a design token in
 * `chart-block.scss` (never a raw hex), so the palette stays owned by
 * `_colors.scss`: `violet` → Angular brand, `blue` → React, `gold` → Vue,
 * `green` → Svelte/remote, `muted` → neutral, `brand` → the brand gradient.
 */
export type ChartColor = 'blue' | 'violet' | 'gold' | 'green' | 'muted' | 'brand';

/** A dated, clickable public source (label · date · url). */
export interface SourceRef {
  readonly label: string;
  readonly date: string;
  readonly url: string;
}

/** One dated point of a metric. `t` is a snapshot id (`'2026-07'`). */
export interface SeriesPoint {
  readonly t: string;
  readonly v: number | null;
}

export interface SnapshotMeta {
  /** Snapshot id, e.g. `'2026-07'`. */
  readonly id: string;
  /** ISO collection date, surfaced as JSON-LD `dateModified`. */
  readonly collected: string;
  /** First snapshot has no month-1 comparison, so deltas stay hidden. */
  readonly baseline: boolean;
  readonly label: LocalizedText;
  readonly updated: LocalizedText;
}

/** A giant KPI number with Sara's one-line read and its source. */
export interface Kpi {
  readonly id: string;
  readonly status: MetricStatus;
  /** Pre-formatted, per-language display value, e.g. `{ fr: '18,2 %', en: '18.2%' }`. */
  readonly value: LocalizedText;
  readonly label: LocalizedText;
  /** Sara's personal reading of the number. */
  readonly angle: LocalizedText;
  readonly source: SourceRef;
}

/** One line/series of a chart. Framework names stay language-neutral (`string`). */
export interface ChartSeries {
  readonly key: string;
  readonly label: LocalizedText | string;
  readonly color: ChartColor;
  readonly points: readonly SeriesPoint[];
}

export interface DonutSegment {
  readonly key: string;
  readonly label: LocalizedText;
  readonly color: ChartColor;
  readonly value: number;
}

export interface BarDatum {
  readonly key: string;
  readonly label: LocalizedText;
  readonly value: number;
}

/** A per-language list (e.g. the FR "anchor" reminders under the AI chart). */
export interface LocalizedList {
  readonly fr: readonly string[];
  readonly en: readonly string[];
}

export interface ChartMetric {
  readonly id: string;
  readonly status: MetricStatus;
  readonly kind: ChartKind;
  readonly title: LocalizedText;
  /** Editorial angle (Sara's read) shown above the chart. */
  readonly angle: LocalizedText;
  /** Honest caveat (sample size, bias…) shown under the chart. */
  readonly note: LocalizedText;
  readonly unit?: string;
  readonly source: SourceRef;
  readonly source2?: SourceRef;
  /** bar / scissors data. */
  readonly series?: readonly ChartSeries[];
  /** donut data. */
  readonly segments?: readonly DonutSegment[];
  /** hbar data. */
  readonly bars?: readonly BarDatum[];
  /** hbar reference marker (e.g. the average daily rate). */
  readonly avg?: number;
  /** scissors: x-axis labels + y-axis label + FR "anchor" reminder chips. */
  readonly x?: readonly string[];
  readonly axisLabel?: LocalizedText;
  readonly anchors?: LocalizedList;
  /** An inline "coming soon" sub-metric (e.g. remote broken down by city). */
  readonly soon?: LocalizedText;
}

/** A metric we can't yet source publicly — shown as a "building it" card. */
export interface SoonBlock {
  readonly id: string;
  readonly title: LocalizedText;
  readonly body: LocalizedText;
  readonly tags: readonly string[];
}

/** One dated monthly snapshot — the unit the live v2 will emit as an array. */
export interface ObservatoireSnapshot {
  readonly meta: SnapshotMeta;
  readonly kpis: readonly Kpi[];
  /** All chart metrics, selected by id in the page layout. */
  readonly charts: readonly ChartMetric[];
  readonly soon: readonly SoonBlock[];
  readonly sources: readonly SourceRef[];
}
