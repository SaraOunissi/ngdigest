import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translateService = inject(TranslateService);

  private readonly _lang = signal<'fr' | 'en'>('fr');
  readonly lang = this._lang.asReadonly();

  /**
   * Sets the active language. Called by LangResolver on every route activation
   * so the language is always in sync with the URL prefix (/fr/... or /en/...).
   * SSR-safe: no browser APIs used.
   */
  setLanguage(lang: 'fr' | 'en'): void {
    this._lang.set(lang);
    this.translateService.use(lang);
  }
}
