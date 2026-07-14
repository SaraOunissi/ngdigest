import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { SoonBlock } from '../../../domain/models/observatoire.model';
import { OBSERVATOIRE_2026_07 } from '../../../infrastructure/observatoire.data';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { ChartBlockComponent } from '../../components/chart-block/chart-block';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Observatoire du marché front FR — les chiffres sourcés — NgDigest',
  en: 'French front-end market observatory — sourced figures — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: "L'état réel du marché front en France, en données sourcées : parts Angular/React, effet de l'IA sur l'emploi, télétravail, TJM Malt par séniorité. Ma lecture, mise à jour chaque mois.",
  en: 'The real state of front-end hiring in France, in sourced data: Angular/React share, the AI effect on jobs, remote work, Malt daily rates by seniority. My read, updated every month.',
};

/** A `SoonBlock` with its bilingual copy already resolved for the template. */
interface ResolvedSoon {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
}

/**
 * /carriere/observatoire — an editorial dashboard on the French front-end
 * market. Renders one dated snapshot (2026-07); every figure is public and
 * sourced, and unsourceable metrics show as "coming soon" blocks.
 */
@Component({
  selector: 'app-observatoire',
  imports: [RouterLink, TranslatePipe, StatCardComponent, ChartBlockComponent],
  templateUrl: './observatoire.html',
  styleUrl: './observatoire.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservatoireComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly snapshot = OBSERVATOIRE_2026_07;
  protected readonly kpis = this.snapshot.kpis;
  protected readonly sources = this.snapshot.sources;

  /**
   * Decorative sparkline bars (viewBox 0 0 140 30) for the "coming soon" cards.
   * Geometry only — no inline styles (CLAUDE.md), no data meaning.
   */
  protected readonly sparkBars = [30, 44, 38, 60, 52, 72, 48].map((height, index) => ({
    x: index * 20 + 2,
    y: 30 - height * 0.3,
    height: height * 0.3,
  }));

  protected readonly technosChart = this.chartById('technos');
  protected readonly iaChart = this.chartById('ia-scissors');
  protected readonly remoteChart = this.chartById('remote');
  protected readonly salaryChart = this.chartById('salary');

  protected readonly metaLabel = computed(() => this.snapshot.meta.label[this.languageService.lang()]);
  protected readonly metaUpdated = computed(() => this.snapshot.meta.updated[this.languageService.lang()]);

  protected readonly frontFsSoon = computed<ResolvedSoon | null>(() => {
    const block = this.snapshot.soon.find((soon) => soon.id === 'front-vs-fullstack');
    return block ? this.resolveSoon(block) : null;
  });

  protected readonly otherSoon = computed<ResolvedSoon[]>(() =>
    this.snapshot.soon
      .filter((soon) => soon.id !== 'front-vs-fullstack')
      .map((soon) => this.resolveSoon(soon)),
  );

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly veilleRoute = computed<string[]>(() => ['/', this.languageService.lang(), 'veille']);

  /** Real destination — Sara's LinkedIn (also used in the footer/about page). */
  protected readonly linkedinUrl = 'https://www.linkedin.com/in/sara-ounissi-8b18a9b7/';

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('observatoire-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: SEO_TITLES[lang],
        description: SEO_DESCRIPTIONS[lang],
        dateModified: this.snapshot.meta.collected,
        isAccessibleForFree: true,
        creator: { '@type': 'Person', name: 'Sara Ounissi' },
        variableMeasured: this.snapshot.kpis.map((kpi) => ({
          '@type': 'PropertyValue',
          name: kpi.label[lang],
          value: kpi.value[lang],
        })),
        citation: this.snapshot.sources.map((source) => ({
          '@type': 'CreativeWork',
          name: source.label,
          url: source.url,
        })),
      });
    });
  }

  private chartById(id: string) {
    const chart = this.snapshot.charts.find((candidate) => candidate.id === id);
    if (!chart) {
      throw new Error(`Observatoire: unknown chart id "${id}"`);
    }
    return chart;
  }

  private resolveSoon(block: SoonBlock): ResolvedSoon {
    const lang = this.languageService.lang();
    return { id: block.id, title: block.title[lang], body: block.body[lang], tags: block.tags };
  }
}
