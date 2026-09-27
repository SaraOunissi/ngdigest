// by project-worker 2026-08-21
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import {
  ToolkitAsset,
  ToolkitCategory,
  ToolkitFile,
  fileForLang,
} from '../../../domain/models/toolkit-asset.model';
import { TOOLKIT_ASSETS, TOOLKIT_CATEGORY_ORDER } from '../../../infrastructure/toolkit.data';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Toolkit carrière dev — CV, mails, fiches de prépa à télécharger — NgDigest',
  en: 'Developer career toolkit — resume, emails, prep sheets to download — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: "Les fichiers à remplir avant de postuler : trame de CV front Angular, checklist de relecture, mails de candidature et de relance, fiches de prépa et de débrief d'entretien. Gratuit, sans email à donner.",
  en: 'The files to fill in before applying: Angular front-end resume template, review checklist, application and follow-up emails, interview prep and debrief sheets. Free, no email required.',
};

/** One asset resolved for the active language (download link included). */
interface ToolkitCard {
  readonly asset: ToolkitAsset;
  readonly primary: ToolkitFile | null;
  readonly secondary: ToolkitFile | null;
}

interface ToolkitGroup {
  readonly category: ToolkitCategory;
  readonly cards: readonly ToolkitCard[];
}

@Component({
  selector: 'app-toolkit',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './toolkit.html',
  styleUrl: './toolkit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolkitComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  /**
   * Assets grouped by family. The download shown first is the one in the reading
   * language; the other language stays reachable as a secondary link (a FR reader
   * applying to a UK company needs the EN file, and vice versa).
   */
  protected readonly groups = computed<ToolkitGroup[]>(() => {
    const lang = this.languageService.lang();
    const other = lang === 'fr' ? 'en' : 'fr';
    return TOOLKIT_CATEGORY_ORDER.map((category) => ({
      category,
      cards: TOOLKIT_ASSETS.filter((asset) => asset.category === category).map((asset) => ({
        asset,
        primary: fileForLang(asset, lang),
        secondary: fileForLang(asset, other),
      })),
    })).filter((group) => group.cards.length > 0);
  });

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly interviewRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return [
      '/',
      lang,
      lang === 'fr' ? 'carriere' : 'career',
      lang === 'fr' ? 'entretien' : 'interview',
    ];
  });

  protected readonly platformsRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return [
      '/',
      lang,
      lang === 'fr' ? 'carriere' : 'career',
      lang === 'fr' ? 'plateformes' : 'platforms',
    ];
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('toolkit-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: SEO_TITLES[lang],
        itemListElement: TOOLKIT_ASSETS.map((asset, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'DigitalDocument',
            name: asset.title[lang],
            description: asset.blurb[lang],
            inLanguage: asset.files.map((file) => file.lang),
            encodingFormat: 'text/markdown',
            dateModified: asset.updated,
          },
        })),
      });
    });
  }

  /** Suggested filename on disk — keeps downloads recognisable in ~/Downloads. */
  protected downloadName(file: ToolkitFile): string {
    return file.path.split('/').pop() ?? 'ngdigest-toolkit.md';
  }
}
