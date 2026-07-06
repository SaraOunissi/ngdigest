import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import {
  CatalogLevel,
  CatalogResource,
  CatalogResourceType,
  CatalogTier,
} from '../../../domain/models/catalog-resource.model';
import { CATALOG_RESOURCES } from '../../../infrastructure/catalog.data';
import { CatalogCardComponent } from '../../components/catalog-card/catalog-card';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Ressources Angular triées à la main — NgDigest',
  en: 'Hand-picked Angular resources — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Ma sélection FR & EN de créateurs, blogs, chaînes et newsletters Angular — vérifiée, avec le pourquoi de chaque entrée.',
  en: 'My FR & EN selection of Angular creators, blogs, channels and newsletters — verified, with the why behind each pick.',
};

type LangFilter = 'all' | 'fr' | 'en';
type GroupFilter = 'all' | CatalogTier;

const TIER_ORDER: Record<CatalogTier, number> = { officiel: 0, gros: 1, solo: 2 };
const DISPLAY_TIERS: readonly CatalogTier[] = ['officiel', 'gros', 'solo'];

interface CatalogGroup {
  readonly tier: CatalogTier;
  readonly resources: CatalogResource[];
}

interface ChipCounts {
  readonly all: number;
  readonly officiel: number;
  readonly gros: number;
  readonly solo: number;
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, TranslatePipe, CatalogCardComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly search = signal('');
  protected readonly langFilter = signal<LangFilter>('all');
  protected readonly group = signal<GroupFilter>('all');
  protected readonly typeFilter = signal<'' | CatalogResourceType>('');
  protected readonly levelFilter = signal<'' | CatalogLevel>('');

  protected readonly chips: readonly GroupFilter[] = ['all', 'officiel', 'gros', 'solo'];
  protected readonly typeOptions: readonly CatalogResourceType[] = ['doc', 'blog', 'youtube', 'podcast', 'newsletter', 'community'];
  protected readonly levelOptions: readonly CatalogLevel[] = ['debutant', 'intermediaire', 'avance', 'tous'];

  /** Resources matching every active filter, ordered by calibre then name. */
  protected readonly filtered = computed<CatalogResource[]>(() => {
    const lang = this.languageService.lang();
    return CATALOG_RESOURCES.filter((resource) => this.matches(resource, lang)).sort(
      (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name),
    );
  });

  /** Sections to render when no single calibre is selected. */
  protected readonly groups = computed<CatalogGroup[]>(() => {
    const list = this.filtered();
    return DISPLAY_TIERS.map((tier) => ({
      tier,
      resources: list.filter((resource) => resource.tier === tier),
    })).filter((groupSection) => groupSection.resources.length > 0);
  });

  /** Live counts per calibre chip — every filter applies except the calibre itself. */
  protected readonly chipCounts = computed<ChipCounts>(() => {
    const lang = this.languageService.lang();
    const pool = CATALOG_RESOURCES.filter((resource) => this.matchesExceptGroup(resource, lang));
    return {
      all: pool.length,
      officiel: pool.filter((resource) => resource.tier === 'officiel').length,
      gros: pool.filter((resource) => resource.tier === 'gros').length,
      solo: pool.filter((resource) => resource.tier === 'solo').length,
    };
  });

  protected readonly resultCount = computed(() => this.filtered().length);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }

  protected chipCount(chip: GroupFilter): number {
    return this.chipCounts()[chip];
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onTypeChange(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value as '' | CatalogResourceType);
  }

  protected onLevelChange(event: Event): void {
    this.levelFilter.set((event.target as HTMLSelectElement).value as '' | CatalogLevel);
  }

  protected reset(): void {
    this.search.set('');
    this.langFilter.set('all');
    this.group.set('all');
    this.typeFilter.set('');
    this.levelFilter.set('');
  }

  private matches(resource: CatalogResource, lang: 'fr' | 'en'): boolean {
    if (this.group() !== 'all' && resource.tier !== this.group()) {
      return false;
    }
    return this.matchesExceptGroup(resource, lang);
  }

  private matchesExceptGroup(resource: CatalogResource, lang: 'fr' | 'en'): boolean {
    if (this.langFilter() !== 'all' && resource.lang !== this.langFilter()) {
      return false;
    }
    if (this.typeFilter() && resource.type !== this.typeFilter()) {
      return false;
    }
    if (this.levelFilter() && resource.level !== this.levelFilter()) {
      return false;
    }
    const query = this.search().trim().toLowerCase();
    if (query) {
      const haystack =
        `${resource.name} ${resource.author} ${resource.shortDesc[lang]} ${resource.value[lang]} ${resource.type}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  }
}
