import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly languageService = inject(LanguageService);

  protected legalNoticeRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'mentions-legales' : 'legal-notice'];
  }

  protected toolsRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'outils' : 'tools'];
  }

  /** Étude de cas de NgDigest sur le Lab de La Développeuse (maillage entre les sites de Sara). */
  protected caseStudyUrl(): string {
    return this.languageService.lang() === 'fr'
      ? 'https://ladeveloppeuse.com/lab/ngdigest'
      : 'https://ladeveloppeuse.com/en/lab/ngdigest';
  }

  protected privacyPolicyRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'politique-confidentialite' : 'privacy-policy'];
  }
}
