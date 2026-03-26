import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LanguageService } from '../services/language.service';

export const langResolver: ResolveFn<'fr' | 'en'> = (route) => {
  const languageService = inject(LanguageService);
  const lang = route.paramMap.get('lang') as 'fr' | 'en';
  languageService.setLanguage(lang);
  return lang;
};
