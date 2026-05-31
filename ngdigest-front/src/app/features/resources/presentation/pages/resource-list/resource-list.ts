import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { ResourceHttpRepository } from '../../../infrastructure/repositories/resource-http.repository';
import { Resource } from '../../../domain/models/resource.model';
import { AngularBanner } from '../../components/angular-banner/angular-banner';
import { HeroSection, HeroStats } from '../../components/hero-section/hero-section';
import { ResourceCard } from '../../components/resource-card/resource-card';

interface ResourceGroup {
  readonly labelKey: string;
  readonly resources: Resource[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRUSTED_SOURCES_COUNT = 35;
const AGGREGATION_FREQUENCY_HOURS = 12;

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'NgDigest — Veille Angular FR & EN',
  en: 'NgDigest — Angular Watch FR & EN',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'NgDigest — votre veille Angular centralisée et curée. Articles FR et EN sélectionnés par pertinence.',
  en: 'NgDigest — your curated Angular watch. FR and EN articles selected by relevance.',
};

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * MS_PER_DAY);
}

@Component({
  selector: 'app-resource-list',
  imports: [TranslatePipe, HeroSection, ResourceCard, AngularBanner],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceListComponent {
  private readonly resourceRepository = inject(ResourceHttpRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly seoService = inject(SeoService);
  protected readonly languageService = inject(LanguageService);

  protected readonly angularVersion = signal<string | null>(null);
  protected readonly resources = signal<Resource[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly hasMore = signal(true);
  protected readonly searchQuery = signal<string>('');

  protected readonly groupedResources = computed<ResourceGroup[]>(() => {
    const resources = this.resources().filter((r): r is Resource & { publishedAt: string } => r.publishedAt !== null);
    const cutoff7d = daysAgo(7);
    const cutoff30d = daysAgo(30);
    const cutoff90d = daysAgo(90);

    const groups: ResourceGroup[] = [
      {
        labelKey: 'group.lastSevenDays',
        resources: resources.filter(r => new Date(r.publishedAt) >= cutoff7d),
      },
      {
        labelKey: 'group.lastMonth',
        resources: resources.filter(r => {
          const date = new Date(r.publishedAt);
          return date < cutoff7d && date >= cutoff30d;
        }),
      },
      {
        labelKey: 'group.lastThreeMonths',
        resources: resources.filter(r => {
          const date = new Date(r.publishedAt);
          return date < cutoff30d && date >= cutoff90d;
        }),
      },
      {
        labelKey: 'group.older',
        resources: resources.filter(r => new Date(r.publishedAt) < cutoff90d),
      },
    ];

    return groups.filter(group => group.resources.length > 0);
  });

  protected readonly heroStats = computed<HeroStats>(() => ({
    resources: this.resources().length,
    sources: TRUSTED_SOURCES_COUNT,
    frequencyHours: AGGREGATION_FREQUENCY_HOURS,
  }));

  // Top-scoring resource from the last 7 days (fallback : highest score overall).
  protected readonly weeklyPick = computed<Resource | null>(() => {
    const search = this.searchQuery();
    if (search.trim().length > 0) return null;

    const dated = this.resources()
      .filter((r): r is Resource & { publishedAt: string } => r.publishedAt !== null);
    if (dated.length === 0) return null;

    const cutoff7d = daysAgo(7);
    const recent = dated.filter(r => new Date(r.publishedAt) >= cutoff7d);
    const pool = recent.length > 0 ? recent : dated;

    return pool.reduce((best, current) => current.score > best.score ? current : best);
  });

  constructor() {
    this.http
      .get<{ tag_name: string }>(
        'https://api.github.com/repos/angular/angular/releases/latest',
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tag_name }) => this.angularVersion.set(tag_name),
        error: () => {},
      });

    // Language changes trigger an immediate reset and reload.
    // searchQuery is read via untracked() so it doesn't re-trigger this effect.
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.resources.set([]);
      this.currentPage.set(1);
      this.hasMore.set(true);
      this.loadResources(1, untracked(this.searchQuery), lang);
    });

    // Search changes trigger a debounced reset and reload.
    // skip(1) avoids double-loading on init (lang effect handles the first load).
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(search => {
        this.resources.set([]);
        this.currentPage.set(1);
        this.hasMore.set(true);
        this.loadResources(1, search, this.languageService.lang());
      });

  }

  protected loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);
    this.loadResources(nextPage, this.searchQuery(), this.languageService.lang());
  }

  private loadResources(page: number, search?: string, lang: 'fr' | 'en' | 'all' = 'all'): void {
    if (page === 1) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }
    this.errorMessage.set(null);

    this.resourceRepository
      .getAll(lang, page, 20, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resources, total }) => {
          this.resources.update(prev => page === 1 ? resources : [...prev, ...resources]);
          this.hasMore.set(this.resources().length < total);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.errorMessage.set('resource.error');
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          if (page > 1) {
            this.currentPage.set(page - 1);
            this.hasMore.set(false);
          }
        },
      });
  }
}
