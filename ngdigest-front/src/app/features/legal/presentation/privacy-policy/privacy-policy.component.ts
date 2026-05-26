import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Politique de confidentialité — NgDigest',
  en: 'Privacy policy — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Politique de confidentialité de NgDigest : Google Analytics avec consentement, aucun profilage, RGPD.',
  en: 'NgDigest privacy policy: Google Analytics with opt-in consent, no profiling, GDPR compliant.',
};

const ALTERNATE_URLS: Record<'fr' | 'en', string> = {
  fr: 'https://ngdigest.co/en/privacy-policy',
  en: 'https://ngdigest.co/fr/politique-confidentialite',
};

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent {
  private readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang, ALTERNATE_URLS[lang]);
    });
  }
}
