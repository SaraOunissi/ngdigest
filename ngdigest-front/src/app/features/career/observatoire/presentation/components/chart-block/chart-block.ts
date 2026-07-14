import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { IconComponent } from '@shared/components/icon/icon';
import { LocalizedText } from '@shared/models/localized-text';
import {
  ChartColor,
  ChartMetric,
  ChartSeries,
} from '../../../domain/models/observatoire.model';

/** One point of an SVG scatter/line, in viewBox user units. */
interface Point {
  readonly x: number;
  readonly y: number;
}

interface BarVm {
  readonly bars: readonly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly color: ChartColor;
    readonly label: string;
    readonly valueLabel: string;
    readonly labelX: number;
    readonly labelY: number;
    readonly valueY: number;
  }[];
  readonly baselineY: number;
  readonly baselineX1: number;
  readonly baselineX2: number;
}

interface HbarVm {
  readonly bars: readonly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly label: string;
    readonly valueLabel: string;
    readonly labelX: number;
    readonly valueX: number;
    readonly centerY: number;
  }[];
  readonly gradientId: string;
  readonly avgX: number | null;
  readonly avgTop: number;
  readonly avgBottom: number;
}

interface DonutVm {
  readonly segments: readonly {
    readonly color: ChartColor;
    readonly dash: number;
    readonly gap: number;
    readonly rotate: number;
    readonly label: string;
    readonly valueLabel: string;
  }[];
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly strokeWidth: number;
}

interface ScissorsVm {
  readonly lines: readonly {
    readonly color: ChartColor;
    readonly polyline: string;
    readonly dots: readonly Point[];
    readonly label: string;
  }[];
  readonly xLabels: readonly { readonly x: number; readonly text: string }[];
  readonly gridLines: readonly { readonly y: number; readonly value: number }[];
  readonly axisLabel: string;
  readonly axisX: number;
  readonly axisY: number;
  readonly baselineY: number;
  readonly padLeft: number;
  readonly padRight: number;
  readonly width: number;
}

interface TableCell {
  readonly text: string;
  readonly color?: ChartColor;
  readonly num?: boolean;
}

interface ChartTable {
  readonly headKeys: readonly string[];
  readonly rows: readonly { readonly cells: readonly TableCell[] }[];
}

/**
 * A reusable chart card: title + editorial angle + an inline SVG chart
 * (`bar` | `hbar` | `donut` | `scissors`) + an accessible `<details>` data
 * table + caveat note + dated source(s).
 *
 * Charts are hand-drawn SVG (no external library) so they render identically
 * during SSR/prerender — crawlers and social cards see the data, not an empty
 * canvas — and stay dependency-free and on-brand. Colours come from design
 * tokens via `chart-fill--*` / `chart-stroke--*` classes (see the SCSS).
 */
@Component({
  selector: 'app-chart-block',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './chart-block.html',
  styleUrl: './chart-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartBlockComponent {
  private readonly languageService = inject(LanguageService);

  readonly metric = input.required<ChartMetric>();
  /** The centrepiece scissors chart renders wider and taller. */
  readonly hero = input(false);

  protected readonly title = computed(() => this.text(this.metric().title));
  protected readonly angle = computed(() => this.text(this.metric().angle));
  protected readonly note = computed(() => this.text(this.metric().note));

  protected readonly anchors = computed<readonly string[] | null>(() => {
    const anchors = this.metric().anchors;
    return anchors ? anchors[this.languageService.lang()] : null;
  });

  protected readonly soonText = computed<string | null>(() => {
    const soon = this.metric().soon;
    return soon ? this.text(soon) : null;
  });

  protected readonly avgLabel = computed<string | null>(() => {
    const metric = this.metric();
    return metric.avg != null ? `${this.fmt(metric.avg)} ${metric.unit ?? ''}`.trim() : null;
  });

  // ── Chart view-models (only the one matching `kind` is non-null) ───────────
  protected readonly barVm = computed<BarVm | null>(() =>
    this.metric().kind === 'bar' ? this.buildBar() : null,
  );
  protected readonly hbarVm = computed<HbarVm | null>(() =>
    this.metric().kind === 'hbar' ? this.buildHbar() : null,
  );
  protected readonly donutVm = computed<DonutVm | null>(() =>
    this.metric().kind === 'donut' ? this.buildDonut() : null,
  );
  protected readonly scissorsVm = computed<ScissorsVm | null>(() =>
    this.metric().kind === 'scissors' ? this.buildScissors() : null,
  );

  protected readonly table = computed<ChartTable>(() => this.buildTable());
  protected readonly ariaLabel = computed(() => this.buildAria());

  // ── bar (vertical) ─────────────────────────────────────────────────────────
  private buildBar(): BarVm {
    const width = 360;
    const height = 240;
    const padX = 14;
    const padTop = 24;
    const padBottom = 34;
    const plotW = width - padX * 2;
    const plotH = height - padTop - padBottom;
    const max = 50;
    const series = this.metric().series ?? [];
    const band = plotW / series.length;
    const barWidth = Math.min(band * 0.56, 58);
    const baselineY = padTop + plotH;

    const bars = series.map((serie) => {
      const value = this.lastValue(serie);
      const center = padX + series.indexOf(serie) * band + band / 2;
      const barHeight = (value / max) * plotH;
      const y = baselineY - barHeight;
      return {
        x: center - barWidth / 2,
        y,
        width: barWidth,
        height: barHeight,
        color: serie.color,
        label: this.text(serie.label),
        valueLabel: `${this.fmt(value)} %`,
        labelX: center,
        labelY: baselineY + 20,
        valueY: y - 7,
      };
    });

    return { bars, baselineY, baselineX1: padX, baselineX2: width - padX };
  }

  // ── hbar (horizontal) ──────────────────────────────────────────────────────
  private buildHbar(): HbarVm {
    const width = 360;
    const height = 230;
    const padLeft = 66;
    const padRight = 46;
    const padTop = 12;
    const padBottom = 26;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const max = 600;
    const bars = this.metric().bars ?? [];
    const rowH = plotH / bars.length;
    const thickness = Math.min(rowH * 0.5, 22);

    const rows = bars.map((bar, index) => {
      const rowTop = padTop + index * rowH;
      const centerY = rowTop + rowH / 2;
      const barWidth = (bar.value / max) * plotW;
      return {
        x: padLeft,
        y: centerY - thickness / 2,
        width: barWidth,
        height: thickness,
        label: this.text(bar.label),
        valueLabel: `${this.fmt(bar.value)} €`,
        labelX: padLeft - 8,
        valueX: padLeft + barWidth + 6,
        centerY,
      };
    });

    const avg = this.metric().avg;
    return {
      bars: rows,
      gradientId: `obsGrad-${this.metric().id}`,
      avgX: avg != null ? padLeft + (avg / max) * plotW : null,
      avgTop: padTop,
      avgBottom: padTop + plotH,
    };
  }

  // ── donut ───────────────────────────────────────────────────────────────────
  private buildDonut(): DonutVm {
    const cx = 120;
    const cy = 120;
    const r = 84;
    const strokeWidth = 30;
    const circ = 2 * Math.PI * r;
    const segments = this.metric().segments ?? [];
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    let startFraction = 0;
    const built = segments.map((segment) => {
      const fraction = segment.value / total;
      const dash = fraction * circ;
      const rotate = -90 + startFraction * 360;
      startFraction += fraction;
      return {
        color: segment.color,
        dash,
        gap: circ - dash,
        rotate,
        label: this.text(segment.label),
        valueLabel: `${this.fmt(segment.value)} %`,
      };
    });

    return { segments: built, cx, cy, r, strokeWidth };
  }

  // ── scissors (line) ─────────────────────────────────────────────────────────
  private buildScissors(): ScissorsVm {
    const width = 680;
    const height = 260;
    const padLeft = 46;
    const padRight = 18;
    const padTop = 24;
    const padBottom = 36;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const max = 250;
    const metric = this.metric();
    const xTicks = metric.x ?? [];
    const series = metric.series ?? [];
    const baselineY = padTop + plotH;

    const xAt = (index: number): number =>
      xTicks.length > 1 ? padLeft + (index / (xTicks.length - 1)) * plotW : padLeft;
    const yAt = (value: number): number => padTop + plotH - (value / max) * plotH;

    const lines = series.map((serie) => {
      const dots: Point[] = [];
      serie.points.forEach((point, index) => {
        if (point.v != null) {
          dots.push({ x: xAt(index), y: yAt(point.v) });
        }
      });
      return {
        color: serie.color,
        polyline: dots.map((dot) => `${dot.x},${dot.y}`).join(' '),
        dots,
        label: this.text(serie.label),
      };
    });

    const gridLines = [0, 100, 200].map((value) => ({ y: yAt(value), value }));
    const xLabels = xTicks.map((text, index) => ({ x: xAt(index), text }));

    return {
      lines,
      xLabels,
      gridLines,
      axisLabel: this.text(metric.axisLabel ?? { fr: '', en: '' }),
      axisX: 14,
      axisY: padTop + plotH / 2,
      baselineY,
      padLeft,
      padRight,
      width,
    };
  }

  // ── Accessible data table (fallback for the SVG) ───────────────────────────
  private buildTable(): ChartTable {
    const metric = this.metric();
    switch (metric.kind) {
      case 'bar':
        return {
          headKeys: ['observatoire.th.item', 'observatoire.th.value'],
          rows: (metric.series ?? []).map((serie) => ({
            cells: [
              { text: this.text(serie.label), color: serie.color },
              { text: `${this.fmt(this.lastValue(serie))} %`, num: true },
            ],
          })),
        };
      case 'hbar':
        return {
          headKeys: ['observatoire.th.level', 'observatoire.th.value'],
          rows: (metric.bars ?? []).map((bar) => ({
            cells: [
              { text: this.text(bar.label) },
              { text: `${this.fmt(bar.value)} €/j`, num: true },
            ],
          })),
        };
      case 'donut':
        return {
          headKeys: ['observatoire.th.item', 'observatoire.th.value'],
          rows: (metric.segments ?? []).map((segment) => ({
            cells: [
              { text: this.text(segment.label), color: segment.color },
              { text: `${this.fmt(segment.value)} %`, num: true },
            ],
          })),
        };
      case 'scissors': {
        const series = metric.series ?? [];
        return {
          headKeys: ['observatoire.th.period', ...series.map((serie) => this.text(serie.label))],
          rows: (metric.x ?? []).map((period, index) => ({
            cells: [
              { text: period },
              ...series.map((serie) => {
                const value = serie.points[index]?.v;
                return { text: value == null ? '—' : this.fmt(value), num: true };
              }),
            ],
          })),
        };
      }
    }
  }

  private buildAria(): string {
    const metric = this.metric();
    const title = this.text(metric.title);
    let parts: string[] = [];
    switch (metric.kind) {
      case 'bar':
        parts = (metric.series ?? []).map(
          (serie) => `${this.text(serie.label)} ${this.fmt(this.lastValue(serie))} %`,
        );
        break;
      case 'hbar':
        parts = (metric.bars ?? []).map((bar) => `${this.text(bar.label)} ${this.fmt(bar.value)} €/j`);
        break;
      case 'donut':
        parts = (metric.segments ?? []).map(
          (segment) => `${this.text(segment.label)} ${this.fmt(segment.value)} %`,
        );
        break;
      case 'scissors':
        parts = (metric.series ?? []).map((serie) => {
          const values = serie.points
            .map((point) => (point.v == null ? '—' : this.fmt(point.v)))
            .join(' → ');
          return `${this.text(serie.label)} ${values}`;
        });
        break;
    }
    return `${title} — ${parts.join(', ')}`;
  }

  private lastValue(serie: ChartSeries): number {
    for (let index = serie.points.length - 1; index >= 0; index -= 1) {
      const value = serie.points[index].v;
      if (value != null) {
        return value;
      }
    }
    return 0;
  }

  private text(value: LocalizedText | string): string {
    return typeof value === 'string' ? value : value[this.languageService.lang()];
  }

  private fmt(value: number): string {
    const text = value.toString();
    return this.languageService.lang() === 'fr' ? text.replace('.', ',') : text;
  }
}
