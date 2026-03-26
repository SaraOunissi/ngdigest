import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from './core/services/language.service';
import { FooterComponent } from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  switchLang(targetLang: 'fr' | 'en'): void {
    const currentUrl = this.router.url;
    const newUrl = currentUrl.replace(/^\/(fr|en)(\/|$)/, `/${targetLang}$2`);
    this.router.navigateByUrl(newUrl);
  }
}
