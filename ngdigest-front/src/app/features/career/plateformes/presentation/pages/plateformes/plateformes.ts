import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { Platform, PlatformCategory } from '../../../domain/models/platform.model';
import { PLATFORMS } from '../../../infrastructure/platforms.data';
import { PlatformCardComponent } from '../../components/platform-card/platform-card';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Plateformes & statut — où trouver du travail Angular — NgDigest',
  en: 'Platforms & status — where to find Angular work — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Mon annuaire des canaux pour trouver des missions freelance, un CDI ou une ESN — plus le portage salarial pour choisir ton statut. Des canaux vérifiés, pas des offres.',
  en: 'My directory of channels to find freelance gigs, a permanent role or a consultancy — plus umbrella employment to pick your status. Verified channels, not listings.',
};

type GeoFilter = 'all' | 'fr' | 'intl';
type CategoryFilter = 'all' | PlatformCategory;

/** Categories grouped under each editorial family, in display order. */
const FAMILY_CATEGORIES: Record<'work' | 'status', readonly PlatformCategory[]> = {
  work: ['freelance', 'cdi', 'esn'],
  status: ['portage'],
};

const FAMILY_ORDER: readonly ('work' | 'status')[] = ['work', 'status'];

interface CategoryGroup {
  readonly category: PlatformCategory;
  readonly platforms: Platform[];
}

interface FamilyGroup {
  readonly id: 'work' | 'status';
  readonly categories: CategoryGroup[];
}

@Component({
  selector: 'app-plateformes',
  imports: [RouterLink, TranslatePipe, PlatformCardComponent],
  templateUrl: './plateformes.html',
  styleUrl: './plateformes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlateformesComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly search = signal('');
  protected readonly geoFilter = signal<GeoFilter>('all');
  protected readonly chip = signal<CategoryFilter>('all');

  /**
   * Data is a static import, so it resolves synchronously — this flag stays
   * false. It is wired to the skeleton state so a future repository-backed load
   * can flip it to true without touching the template.
   */
  protected readonly loading = signal(false);

  protected readonly chips: readonly CategoryFilter[] = [
    'all',
    'freelance',
    'cdi',
    'esn',
    'portage',
  ];
  protected readonly skeletons: readonly number[] = [0, 1, 2, 3, 5, 6];

  /** Platforms matching every active filter, featured first, then by name. */
  protected readonly filtered = computed<Platform[]>(() => {
    const lang = this.languageService.lang();
    return PLATFORMS.filter((platform) => this.matches(platform, lang)).sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name)
    );
  });

  /** The two editorial families, each with its non-empty category sub-groups. */
  protected readonly families = computed<FamilyGroup[]>(() => {
    const list = this.filtered();
    return FAMILY_ORDER.map((id) => ({
      id,
      categories: FAMILY_CATEGORIES[id]
        .map((category) => ({
          category,
          platforms: list.filter((platform) => platform.category === category),
        }))
        .filter((group) => group.platforms.length > 0),
    })).filter((family) => family.categories.length > 0);
  });

  /** Live counts per chip — every filter applies except the chip itself. */
  protected readonly chipCounts = computed<Record<CategoryFilter, number>>(() => {
    const lang = this.languageService.lang();
    const pool = PLATFORMS.filter((platform) => this.matchesExceptChip(platform, lang));
    return {
      all: pool.length,
      freelance: pool.filter((platform) => platform.category === 'freelance').length,
      cdi: pool.filter((platform) => platform.category === 'cdi').length,
      esn: pool.filter((platform) => platform.category === 'esn').length,
      portage: pool.filter((platform) => platform.category === 'portage').length,
    };
  });

  protected readonly resultCount = computed(() => this.filtered().length);

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly jobsRoute = computed<string[]>(() => [
    '/',
    this.languageService.lang(),
    'jobs',
  ]);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('platforms-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: SEO_TITLES[lang],
        itemListElement: PLATFORMS.map((platform, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: platform.name,
          description: platform.blurb[lang],
          url: platform.url,
        })),
      });
    });
  }

  protected chipCount(chip: CategoryFilter): number {
    return this.chipCounts()[chip];
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected reset(): void {
    this.search.set('');
    this.geoFilter.set('all');
    this.chip.set('all');
  }

  private matches(platform: Platform, lang: 'fr' | 'en'): boolean {
    if (this.chip() !== 'all' && platform.category !== this.chip()) {
      return false;
    }
    return this.matchesExceptChip(platform, lang);
  }

  private matchesExceptChip(platform: Platform, lang: 'fr' | 'en'): boolean {
    if (this.geoFilter() !== 'all' && platform.geo !== this.geoFilter()) {
      return false;
    }
    const query = this.search().trim().toLowerCase();
    if (query) {
      const haystack =
        `${platform.name} ${platform.blurb[lang]} ${platform.tags.join(' ')} ${platform.category}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  }
}
