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
import { environment } from '../../../../../../../environments/environment';
import { Formation, FormationPick } from '../../../domain/models/formation.model';
import { FORMATIONS } from '../../../infrastructure/formations.data';
import { FormationCardComponent } from '../../components/formation-card/formation-card';

const BASE_URL = environment.baseUrl;

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Formations Angular — les meilleures, triées à la main — NgDigest',
  en: 'Angular training — the best, hand-picked — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Mon annuaire des meilleures formations Angular — FR & EN, gratuit & payant, du tuto officiel au workshop testing. Vérifié, avec le pourquoi de chaque choix.',
  en: 'My directory of the best Angular training — FR & EN, free & paid, from the official tutorial to the testing workshop. Verified, with the why behind each pick.',
};

/** FR ↔ EN slugs differ, so the alternate URL is built explicitly (like blog posts). */
const ALTERNATE_PATH: Record<'fr' | 'en', string> = {
  fr: '/en/career/trainings',
  en: '/fr/carriere/formations',
};

type LangFilter = 'all' | 'fr' | 'en';
type FormationChip = 'all' | 'free' | 'paid' | 'debutant' | 'senior' | 'testing';

/** Editorial order the "Sélection" picks are displayed in. */
const PICK_ORDER: Record<FormationPick, number> = { debutant: 0, signals: 1, testing: 2, fr: 3 };

@Component({
  selector: 'app-formations',
  imports: [RouterLink, TranslatePipe, FormationCardComponent],
  templateUrl: './formations.html',
  styleUrl: './formations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationsComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly search = signal('');
  protected readonly langFilter = signal<LangFilter>('all');
  protected readonly chip = signal<FormationChip>('all');

  /**
   * Data is a static import, so it resolves synchronously — this flag stays
   * false. It is wired to the skeleton state so a future repository-backed load
   * can flip it to true without touching the template.
   */
  protected readonly loading = signal(false);

  protected readonly chips: readonly FormationChip[] = [
    'all',
    'free',
    'paid',
    'debutant',
    'senior',
    'testing',
  ];
  protected readonly skeletons: readonly number[] = [0, 1, 2, 3, 5, 6];

  /** The editorial picks, in a stable curated order, for the "Sélection" block. */
  protected readonly featured = computed<Formation[]>(() =>
    FORMATIONS.filter((formation) => formation.featured).sort(
      (a, b) =>
        (a.featuredPick ? PICK_ORDER[a.featuredPick] : 99) -
        (b.featuredPick ? PICK_ORDER[b.featuredPick] : 99)
    )
  );

  /** Formations matching every active filter, featured first, then by title. */
  protected readonly filtered = computed<Formation[]>(() => {
    const lang = this.languageService.lang();
    return FORMATIONS.filter((formation) => this.matches(formation, lang)).sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title)
    );
  });

  /** Live counts per chip — every filter applies except the chip itself. */
  protected readonly chipCounts = computed<Record<FormationChip, number>>(() => {
    const lang = this.languageService.lang();
    const pool = FORMATIONS.filter((formation) => this.matchesExceptChip(formation, lang));
    return {
      all: pool.length,
      free: pool.filter((formation) => formation.pricing === 'free').length,
      paid: pool.filter((formation) => formation.pricing === 'paid').length,
      debutant: pool.filter((formation) => formation.level === 'debutant').length,
      senior: pool.filter((formation) => formation.level === 'senior').length,
      testing: pool.filter((formation) => formation.tags.includes('testing')).length,
    };
  });

  protected readonly resultCount = computed(() => this.filtered().length);

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly certRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career', 'certifications'];
  });

  protected readonly catalogRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'ressources' : 'resources'];
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(
        SEO_TITLES[lang],
        SEO_DESCRIPTIONS[lang],
        lang,
        `${BASE_URL}${ALTERNATE_PATH[lang]}`
      );
      this.seoService.setJsonLd('formations-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: SEO_TITLES[lang],
        itemListElement: FORMATIONS.map((formation, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: formation.title,
          description: formation.blurb[lang],
          url: formation.url,
        })),
      });
    });
  }

  protected chipCount(chip: FormationChip): number {
    return this.chipCounts()[chip];
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected reset(): void {
    this.search.set('');
    this.langFilter.set('all');
    this.chip.set('all');
  }

  private matches(formation: Formation, lang: 'fr' | 'en'): boolean {
    if (!this.matchesChip(formation, this.chip())) {
      return false;
    }
    return this.matchesExceptChip(formation, lang);
  }

  private matchesChip(formation: Formation, chip: FormationChip): boolean {
    switch (chip) {
      case 'all':
        return true;
      case 'free':
      case 'paid':
        return formation.pricing === chip;
      case 'debutant':
      case 'senior':
        return formation.level === chip;
      case 'testing':
        return formation.tags.includes('testing');
    }
  }

  private matchesExceptChip(formation: Formation, lang: 'fr' | 'en'): boolean {
    if (this.langFilter() !== 'all' && formation.lang !== this.langFilter()) {
      return false;
    }
    const query = this.search().trim().toLowerCase();
    if (query) {
      const haystack =
        `${formation.title} ${formation.author} ${formation.blurb[lang]} ${formation.tags.join(' ')} ${formation.format}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  }
}
