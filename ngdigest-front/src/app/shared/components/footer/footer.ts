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

  protected privacyPolicyRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'politique-confidentialite' : 'privacy-policy'];
  }
}
