import { ChangeDetectionStrategy, Component, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AnalyticsService } from '@core/services/analytics.service';
import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { BLOG_DATA } from '@features/blog/infrastructure/blog-data.generated';
import {
  AngularCycle,
  CycleStatus,
  RELEASE_SCHEDULE_CHECKED_ON,
  allStatuses,
  defaultMajor,
  findCycle,
  formatDate,
  formatMonth,
  isOlderThanTracked,
  isoToday,
  latestCycle,
  migrationPath,
  parseMajor,
  statusOn,
  supportedCycles,
  upcomingReleases,
  updateGuideUrl,
} from '../../../domain/angular-versions';
import { ANGULAR_RELEASES_DATA } from '../../../infrastructure/angular-releases.generated';

type Lang = 'fr' | 'en';

const BASE_URL = 'https://ngdigest.co';

export const ANGULAR_VERSIONS_PATHS: Readonly<Record<Lang, string>> = {
  fr: '/fr/outils/support-versions-angular',
  en: '/en/tools/angular-version-support',
};

const SEO_TITLES: Record<Lang, string> = {
  fr: 'Angular : versions supportées, LTS et fin de support (2026)',
  en: 'Angular versions: support, LTS and end-of-life dates (2026)',
};

const SEO_DESCRIPTIONS: Record<Lang, string> = {
  fr: "Ta version d'Angular est-elle encore supportée ? Statut, fin de support actif et de LTS, jours restants et chemin de migration, d'après angular.dev.",
  en: 'Is your Angular version still supported? Status, active and LTS end dates, days left and your migration path, based on the official angular.dev policy.',
};

/** Article lié (affiché seulement une fois publié, cf. BLOG_DATA). */
const RELATED_ARTICLE_SLUGS: Readonly<Record<Lang, string>> = {
  fr: 'quelle-version-angular-utiliser-support-2026',
  en: 'which-angular-version-to-use-support-2026',
};

/** Versions affichées d'emblée dans le calendrier ; les plus anciennes sont repliées. */
const TABLE_VISIBLE_ROWS = 6;

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface TableRow {
  readonly major: number;
  readonly release: string;
  readonly activeEnd: string;
  readonly ltsEnd: string;
  readonly latest: string;
  readonly statusKey: string;
  readonly statusClass: string;
}

/**
 * /fr/outils/support-versions-angular — « Ma version d'Angular est-elle encore supportée ? »
 * (plan SEO 1.6). Dates : fichier généré au build depuis endoflife.date (table officielle
 * d'angular.dev) ; statuts et jours restants recalculés à la date du jour dans le navigateur.
 */
@Component({
  selector: 'app-angular-versions',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './angular-versions.html',
  styleUrl: './angular-versions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularVersionsComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly analytics = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  protected readonly data = ANGULAR_RELEASES_DATA;
  protected readonly lang = this.languageService.lang;

  /** Date de référence : celle des données au prérendu, puis la vraie date une fois la page affichée. */
  protected readonly today = signal(this.data.fetchedAt);
  private readonly chosenMajor = signal<number | null>(null);
  protected readonly pasteValue = signal('');
  protected readonly pasteError = signal(false);
  protected readonly copyState = signal<'idle' | 'done' | 'error'>('idle');

  protected readonly oldestTracked = computed(() => this.data.cycles[this.data.cycles.length - 1]);
  protected readonly latest = computed(() => latestCycle(this.data, this.today()));
  protected readonly selectedMajor = computed(() => this.chosenMajor() ?? defaultMajor(this.data, this.today()));
  protected readonly olderOptionMajor = computed(() => this.oldestTracked().major - 1);

  protected readonly selected = computed(() => {
    const major = this.selectedMajor();
    const cycle = findCycle(this.data, major);
    if (cycle) return { major, older: false, info: statusOn(cycle, this.today()) };
    if (isOlderThanTracked(this.data, major)) {
      return { major, older: true, info: statusOn(this.oldestTracked(), this.today()) };
    }
    return null;
  });

  protected readonly statusKey = computed(() => {
    const selected = this.selected();
    if (!selected) return 'eol';
    return selected.info.endingSoon ? 'ltsSoon' : selected.info.status;
  });

  protected readonly path = computed(() => migrationPath(this.data, this.selectedMajor(), this.today()));

  protected readonly pathSteps = computed(() => {
    const steps = this.path();
    return steps.map((to, index) => {
      const from = index === 0 ? this.selectedMajor() : steps[index - 1];
      return { from, to, url: updateGuideUrl(from, to) };
    });
  });

  protected readonly nextRelease = computed(() => upcomingReleases(this.today()).find((release) => release.major) ?? null);
  protected readonly nextMajorLabel = computed(() => {
    const next = this.nextRelease();
    return next ? next.version.split('.')[0] : String(this.latest().major + 1);
  });

  /** Paramètres des textes traduits pour le résultat. */
  protected readonly resultParams = computed((): Record<string, string> => {
    const selected = this.selected();
    const lang = this.lang();
    const next = this.nextRelease();
    if (!selected) return {} as Record<string, string>;
    const cycle = selected.info.cycle;
    const dateKey = selected.info.status === 'active' ? cycle.activeSupportEnd : cycle.ltsEnd;
    return {
      major: String(selected.major),
      oldest: String(this.oldestTracked().major),
      date: formatDate(dateKey, lang),
      ltsEnd: formatDate(cycle.ltsEnd, lang),
      days: String(selected.info.status === 'eol' ? selected.info.daysSinceEol : selected.info.daysLeft),
      version: cycle.latest,
      latestDate: cycle.latestReleaseDate ? formatDate(cycle.latestReleaseDate, lang) : '',
      release: formatDate(cycle.releaseDate, lang),
      activeEnd: formatDate(cycle.activeSupportEnd, lang),
      latest: String(this.latest().major),
      next: next ? `Angular ${this.nextMajorLabel()} (~ ${formatMonth(next.date, lang)})` : `Angular ${this.nextMajorLabel()}`,
      count: String(this.path().length),
    };
  });

  protected readonly headlineKey = computed(() => {
    const selected = this.selected();
    if (!selected) return '';
    return selected.older ? 'versionsTool.result.headline.older' : `versionsTool.result.headline.${selected.info.status}`;
  });

  protected readonly adviceKey = computed(() => {
    const selected = this.selected();
    if (!selected) return '';
    if (selected.info.status === 'active') return 'versionsTool.advice.activeLatest';
    if (selected.info.status === 'lts') return selected.info.endingSoon ? 'versionsTool.advice.ltsSoon' : 'versionsTool.advice.lts';
    return 'versionsTool.advice.eol';
  });

  protected readonly options = computed(() => this.data.cycles.map((cycle) => cycle.major));

  protected readonly tableRows = computed<TableRow[]>(() => {
    const lang = this.lang();
    return allStatuses(this.data, this.today()).map((entry) => toRow(entry, lang));
  });
  protected readonly visibleRows = computed(() => this.tableRows().slice(0, TABLE_VISIBLE_ROWS));
  protected readonly olderRows = computed(() => this.tableRows().slice(TABLE_VISIBLE_ROWS));

  /** Change quand les traductions arrivent ou que la langue change : relance les textes calculés. */
  private readonly translations = toSignal(this.translate.stream('versionsTool.and'), { initialValue: '' });

  protected readonly supportedList = computed(() =>
    this.translations() === undefined ? '' : this.joinList(supportedCycles(this.data, this.today()).map((entry) => `Angular ${entry.cycle.major}`)),
  );
  protected readonly supportedCount = computed(() => supportedCycles(this.data, this.today()).length);

  protected readonly upcoming = computed(() =>
    upcomingReleases(this.today()).map((release) => ({ ...release, month: formatMonth(release.date, this.lang()) })),
  );

  protected readonly pageParams = computed<Record<string, string>>(() => {
    const lang = this.lang();
    const oldestSupported = this.oldestSupported();
    const lts = supportedCycles(this.data, this.today()).filter((entry) => entry.status === 'lts');
    const ltsNames = lts.map((entry) => `Angular ${entry.cycle.major}`);
    const next = this.nextRelease();
    return {
      latest: String(this.latest().major),
      oldest: String(this.oldestTracked().major),
      today: formatDate(this.today(), lang),
      fetched: formatDate(this.data.fetchedAt, lang),
      checked: formatDate(RELEASE_SCHEDULE_CHECKED_ON, lang),
      count: String(this.supportedCount()),
      list: this.supportedList(),
      olderCount: String(this.olderRows().length),
      supportedMajor: String(oldestSupported.major),
      supportedDate: formatDate(oldestSupported.ltsEnd, lang),
      supportedActiveEnd: formatDate(oldestSupported.activeSupportEnd, lang),
      ltsList: ltsNames.length === 1 ? ltsNames[0] : this.joinList(ltsNames),
      ltsVerb: ltsNames.length === 1 ? 'one' : 'many',
      next: this.nextMajorLabel(),
      nextMonth: next ? formatMonth(next.date, lang) : '',
      latestLtsEnd: formatDate(this.latest().ltsEnd, lang),
    };
  });

  /** FAQ : textes résolus (pour le JSON-LD et le gabarit), chiffres issus des données. */

  protected readonly faqItems = computed<FaqItem[]>(() => {
    this.translations();
    const params = this.pageParams();
    const oldestSupported = this.oldestSupported();
    const supportedStatus = statusOn(oldestSupported, this.today()).status;
    const t = (key: string, extra: Record<string, string> = {}): string =>
      this.translate.instant(`versionsTool.faq.${key}`, { ...params, ...extra });
    const ltsSentence =
      params['ltsVerb'] === 'one'
        ? t('listOne', { major: params['ltsList'].replace('Angular ', '') })
        : t('listMany', { list: params['ltsList'] });
    const items: FaqItem[] = [
      {
        q: t('supported.q', { major: params['supportedMajor'] }),
        a: t(supportedStatus === 'active' ? 'supported.aActive' : 'supported.aLts', {
          major: params['supportedMajor'],
          date: params['supportedDate'],
          activeEnd: params['supportedActiveEnd'],
        }),
      },
      { q: t('duration.q'), a: t('duration.a') },
      { q: t('lts.q'), a: t('lts.a', { list: ltsSentence }) },
    ];
    if (this.nextRelease()) {
      items.push({
        q: t('next.q'),
        a: t('next.a', { month: params['nextMonth'], ltsEnd: params['latestLtsEnd'] }),
      });
    }
    items.push({ q: t('eol.q'), a: t('eol.a') });
    return items.filter((item) => !item.q.startsWith('versionsTool.'));
  });

  protected readonly relatedArticle = computed(() => {
    const lang = this.lang();
    return BLOG_DATA.find((article) => article.lang === lang && article.slug === RELATED_ARTICLE_SLUGS[lang]) ?? null;
  });

  protected readonly observatoireRoute = computed(() => {
    const lang = this.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'observatoire' : 'observatory'];
  });
  protected readonly veilleRoute = computed(() => ['/', this.lang(), 'veille']);
  protected readonly homeRoute = computed(() => ['/', this.lang()]);

  private readonly oldestSupported = computed<AngularCycle>(() => {
    const supported = supportedCycles(this.data, this.today());
    return supported.length > 0 ? supported[supported.length - 1].cycle : this.latest();
  });

  constructor() {
    afterNextRender(() => {
      this.today.set(isoToday(new Date()));
      const fromUrl = parseMajor(this.route.snapshot.queryParamMap.get('v'));
      if (fromUrl !== null && (findCycle(this.data, fromUrl) || isOlderThanTracked(this.data, fromUrl))) {
        this.chosenMajor.set(fromUrl);
      }
    });

    effect(() => {
      const lang = this.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('angular-versions-jsonld', this.buildJsonLd(lang, this.faqItems()));
    });
  }

  protected onSelect(event: Event): void {
    const major = Number((event.target as HTMLSelectElement).value);
    this.choose(major);
  }

  protected onPaste(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pasteValue.set(value);
    if (!value.trim()) {
      this.pasteError.set(false);
      return;
    }
    const major = parseMajor(value);
    if (major === null || !(findCycle(this.data, major) || isOlderThanTracked(this.data, major))) {
      this.pasteError.set(true);
      return;
    }
    this.pasteError.set(false);
    this.choose(major);
  }

  protected async copySummary(): Promise<void> {
    const selected = this.selected();
    if (!selected) return;
    const params = this.resultParams();
    const path = this.path();
    const text: string = this.translate.instant('versionsTool.copy.text', {
      major: params['major'],
      status: this.translate.instant(`versionsTool.status.${this.statusKey()}`),
      headline: this.translate.instant(this.headlineKey(), params),
      path: path.length > 0 ? [this.selectedMajor(), ...path].join(' → ') : this.translate.instant('versionsTool.copy.noPath'),
      fetched: formatDate(this.data.fetchedAt, this.lang()),
    });
    try {
      await navigator.clipboard.writeText(text);
      this.copyState.set('done');
      this.analytics.trackEvent('tool_angular_version_copy', { major: selected.major });
    } catch (error: unknown) {
      console.error('[versions] copie impossible', error);
      this.copyState.set('error');
    }
  }

  protected trackGuideClick(from: number, to: number): void {
    this.analytics.trackEvent('tool_angular_version_guide', { from, to });
  }

  private choose(major: number): void {
    this.chosenMajor.set(major);
    this.copyState.set('idle');
    const path = this.location.path().split('?')[0];
    this.location.replaceState(path, `v=${major}`);
    const info = this.selected();
    this.analytics.trackEvent('tool_angular_version_check', { major, status: info?.info.status ?? 'unknown' });
  }

  private joinList(items: readonly string[]): string {
    if (items.length <= 1) return items.join('');
    const and: string = this.translate.instant('versionsTool.and');
    return `${items.slice(0, -1).join(', ')}${and.startsWith('versionsTool.') ? ' & ' : and}${items[items.length - 1]}`;
  }

  private buildJsonLd(lang: Lang, faq: readonly FaqItem[]): object {
    const pageUrl = BASE_URL + ANGULAR_VERSIONS_PATHS[lang];
    const graph: object[] = [
      {
        '@type': 'WebApplication',
        name: SEO_TITLES[lang],
        description: SEO_DESCRIPTIONS[lang],
        url: pageUrl,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        inLanguage: lang,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        dateModified: this.data.fetchedAt,
        author: { '@type': 'Person', name: 'Sara Ounissi' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'NgDigest', item: `${BASE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name: SEO_TITLES[lang], item: pageUrl },
        ],
      },
    ];
    if (faq.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
      });
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }
}

function toRow(entry: CycleStatus, lang: Lang): TableRow {
  const statusKey = entry.endingSoon ? 'ltsSoon' : entry.status;
  return {
    major: entry.cycle.major,
    release: formatDate(entry.cycle.releaseDate, lang),
    activeEnd: formatDate(entry.cycle.activeSupportEnd, lang),
    ltsEnd: formatDate(entry.cycle.ltsEnd, lang),
    latest: entry.cycle.latest,
    statusKey,
    statusClass: `av-status--${statusKey === 'ltsSoon' ? 'soon' : entry.status}`,
  };
}
