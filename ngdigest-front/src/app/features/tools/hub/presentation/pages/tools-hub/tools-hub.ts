import { ChangeDetectionStrategy, Component, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { TOOLKIT_ASSETS } from '@features/career/toolkit/infrastructure/toolkit.data';
import { formatDate, isoToday, statusOn, supportedCycles } from '@features/tools/angular-versions/domain/angular-versions';
import { ANGULAR_RELEASES_DATA } from '@features/tools/angular-versions/infrastructure/angular-releases.generated';

type Lang = 'fr' | 'en';

const BASE_URL = 'https://ngdigest.co';

const SEO_TITLES: Record<Lang, string> = {
  fr: 'Outils gratuits pour développeurs Angular | NgDigest',
  en: 'Free tools for Angular developers | NgDigest',
};

const SEO_DESCRIPTIONS: Record<Lang, string> = {
  fr: "Les outils gratuits de NgDigest : vérifier le support de ta version d'Angular, préparer ta migration, et des modèles de CV et de mails à télécharger.",
  en: 'Free NgDigest tools: check whether your Angular version is still supported, plan your migration, and download resume and email templates.',
};

interface ToolCard {
  readonly id: string;
  readonly kindKey: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly highlight: { readonly key: string; readonly params: Record<string, string> } | null;
  readonly ctaKey: string;
  readonly route: string[];
}

/**
 * /fr/outils · /en/tools — point d'entrée unique des outils gratuits : outils
 * interactifs et Toolkit carrière (qui reste aussi à sa place dans le parcours carrière).
 */
@Component({
  selector: 'app-tools-hub',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './tools-hub.html',
  styleUrl: './tools-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsHubComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  private readonly today = signal(ANGULAR_RELEASES_DATA.fetchedAt);

  protected readonly cards = computed((): ToolCard[] => {
    const lang = this.languageService.lang();
    const supported = supportedCycles(ANGULAR_RELEASES_DATA, this.today());
    const oldest = supported[supported.length - 1]?.cycle ?? null;
    const oldestStatus = oldest ? statusOn(oldest, this.today()) : null;
    const cards: ToolCard[] = [
      {
        id: 'angular-versions',
        kindKey: 'toolsHub.kind.interactive',
        titleKey: 'toolsHub.versions.title',
        bodyKey: 'toolsHub.versions.body',
        highlight:
          oldest && oldestStatus
            ? {
                key: 'toolsHub.versions.highlight',
                params: { major: String(oldest.major), date: formatDate(oldest.ltsEnd, lang), days: String(oldestStatus.daysLeft) },
              }
            : null,
        ctaKey: 'toolsHub.versions.cta',
        route: lang === 'fr' ? ['/', 'fr', 'outils', 'support-versions-angular'] : ['/', 'en', 'tools', 'angular-version-support'],
      },
      {
        id: 'toolkit',
        kindKey: 'toolsHub.kind.download',
        titleKey: 'toolsHub.toolkit.title',
        bodyKey: 'toolsHub.toolkit.body',
        highlight: { key: 'toolsHub.toolkit.highlight', params: { count: String(TOOLKIT_ASSETS.length) } },
        ctaKey: 'toolsHub.toolkit.cta',
        route: ['/', lang, lang === 'fr' ? 'carriere' : 'career', 'toolkit'],
      },
    ];
    return cards;
  });

  constructor() {
    afterNextRender(() => this.today.set(isoToday(new Date())));

    effect(() => {
      const lang = this.languageService.lang();
      const pageUrl = `${BASE_URL}/${lang}/${lang === 'fr' ? 'outils' : 'tools'}`;
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('tools-hub-jsonld', {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'CollectionPage', name: SEO_TITLES[lang], description: SEO_DESCRIPTIONS[lang], url: pageUrl, inLanguage: lang },
          {
            '@type': 'ItemList',
            itemListElement: this.cards().map((card, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${BASE_URL}${card.route.join('/').replace(/^\/+/, '/')}`,
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'NgDigest', item: `${BASE_URL}/${lang}` },
              { '@type': 'ListItem', position: 2, name: SEO_TITLES[lang], item: pageUrl },
            ],
          },
        ],
      });
    });
  }
}
