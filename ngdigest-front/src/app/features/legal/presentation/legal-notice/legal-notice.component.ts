import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Mentions légales — NgDigest',
  en: 'Legal notice — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Mentions légales de NgDigest : éditrice, hébergeurs, propriété intellectuelle.',
  en: 'NgDigest legal notice: publisher, hosting providers, intellectual property.',
};

const ALTERNATE_URLS: Record<'fr' | 'en', string> = {
  fr: 'https://ngdigest.co/en/legal-notice',
  en: 'https://ngdigest.co/fr/mentions-legales',
};

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalNoticeComponent {
  private readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang, ALTERNATE_URLS[lang]);
    });
  }
}
