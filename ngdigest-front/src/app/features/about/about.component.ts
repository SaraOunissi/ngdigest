import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SeoService } from '@core/services/seo.service';
import { LanguageService } from '@core/services/language.service';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'À propos — NgDigest',
  en: 'About — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'NgDigest est une plateforme de veille Angular qui agrège les meilleurs articles et ressources de la communauté.',
  en: 'NgDigest is an Angular tech watch platform that aggregates the best articles and resources from the community.',
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly seoService = inject(SeoService);
  private readonly languageService = inject(LanguageService);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }
}
