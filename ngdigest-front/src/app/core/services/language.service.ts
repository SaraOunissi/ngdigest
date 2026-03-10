import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'ngdigest-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translateService = inject(TranslateService);

  private readonly _lang = signal<'fr' | 'en'>('en');
  readonly lang = this._lang.asReadonly();

  /**
   * Initialises the language from localStorage, falling back to the
   * browser's preferred language, then to English.
   * Must be called once at application startup.
   */
  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as 'fr' | 'en' | null;
    const browserLang: 'fr' | 'en' = navigator.language.startsWith('fr')
      ? 'fr'
      : 'en';
    this.setLanguage(stored ?? browserLang);
  }

  setLanguage(lang: 'fr' | 'en'): void {
    this._lang.set(lang);
    this.translateService.use(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
