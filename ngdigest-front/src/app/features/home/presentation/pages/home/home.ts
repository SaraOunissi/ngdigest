import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { IconComponent, IconName } from '@shared/components/icon/icon';
import { ChipStatus } from '@shared/components/status-chip/status-chip';
import { ResourceHttpRepository } from '@features/resources/infrastructure/repositories/resource-http.repository';
import { Resource } from '@features/resources/domain/models/resource.model';
import { CATALOG_RESOURCES } from '@features/catalog/infrastructure/catalog.data';
import { CERTIFICATIONS } from '@features/career/certifications/infrastructure/certifications.data';
import { INTERVIEW_QUESTIONS } from '@features/career/interview/infrastructure/interview-questions.data';
import { EntryTileComponent, HomeEntry } from '../../components/entry-tile/entry-tile';
import { VeilleCardComponent } from '../../components/veille-card/veille-card';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'NgDigest — Ton copilote carrière Angular',
  en: 'NgDigest — Your Angular career copilot',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Certifs, entretien, missions, veille — tout ce qu’il faut pour avancer dans ta carrière Angular, trié à la main par une dev qui code en prod.',
  en: 'Certifications, interview prep, gigs, tech watch — everything to move your Angular career forward, hand-picked by a dev who ships to production.',
};

/** Hours between two aggregation runs of the tech-watch pipeline. */
const VEILLE_FRESHNESS = '12 h';

interface EntryDefinition {
  readonly id: string;
  readonly icon: IconName;
  readonly titleKey: string;
  readonly descKey: string;
  readonly status: ChipStatus | null;
  readonly route: (lang: 'fr' | 'en') => string[] | null;
}

const ENTRY_DEFINITIONS: readonly EntryDefinition[] = [
  {
    id: 'certifications',
    icon: 'certif',
    titleKey: 'home.entries.certifications.title',
    descKey: 'home.entries.certifications.desc',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', 'certifications'],
  },
  {
    id: 'interview',
    icon: 'entretien',
    titleKey: 'home.entries.interview.title',
    descKey: 'home.entries.interview.desc',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'entretien' : 'interview'],
  },
  {
    id: 'jobs',
    icon: 'jobs',
    titleKey: 'home.entries.jobs.title',
    descKey: 'home.entries.jobs.desc',
    status: null,
    route: (lang) => ['/', lang, 'jobs'],
  },
  {
    id: 'formations',
    icon: 'formations',
    titleKey: 'home.entries.formations.title',
    descKey: 'home.entries.formations.desc',
    status: 'soon',
    route: () => null,
  },
  {
    id: 'resources',
    icon: 'ressources',
    titleKey: 'home.entries.resources.title',
    descKey: 'home.entries.resources.desc',
    status: null,
    route: (lang) => ['/', lang, lang === 'fr' ? 'ressources' : 'resources'],
  },
  {
    id: 'observatoire',
    icon: 'observatoire',
    titleKey: 'home.entries.observatoire.title',
    descKey: 'home.entries.observatoire.desc',
    status: 'soon',
    route: () => null,
  },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe, IconComponent, EntryTileComponent, VeilleCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly resourceRepository = inject(ResourceHttpRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly veille = signal<Resource[]>([]);
  protected readonly featuredPick = computed<Resource | null>(() => this.veille()[0] ?? null);
  protected readonly secondaryPicks = computed<Resource[]>(() => this.veille().slice(1, 3));

  protected readonly entries = computed<HomeEntry[]>(() => {
    const lang = this.languageService.lang();
    return ENTRY_DEFINITIONS.map((def) => ({
      id: def.id,
      icon: def.icon,
      titleKey: def.titleKey,
      descKey: def.descKey,
      status: def.status,
      route: def.route(lang),
    }));
  });

  protected readonly stats = {
    questions: INTERVIEW_QUESTIONS.length,
    certLevels: CERTIFICATIONS.filter((cert) => cert.cat === 'angular').length,
    catalog: CATALOG_RESOURCES.length,
    freshness: VEILLE_FRESHNESS,
  };

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly jobsRoute = computed<string[]>(() => ['/', this.languageService.lang(), 'jobs']);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.loadVeille(lang);
    });
  }

  private loadVeille(lang: 'fr' | 'en'): void {
    // The tech-watch feed is live data — only fetch in the browser so prerender
    // stays static; the band hydrates client-side.
    if (!this.isBrowser) {
      return;
    }
    this.resourceRepository
      .getAll(lang, 1, 6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resources }) => {
          const sorted = [...resources].sort((a, b) => b.score - a.score);
          this.veille.set(sorted.slice(0, 3));
        },
        error: () => this.veille.set([]),
      });
  }
}
