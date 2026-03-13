import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Centralises all SEO concerns: page title, meta description, and OG tags.
 * Also keeps the `<html lang>` attribute in sync with the active language.
 *
 * Note: without SSR, meta tags are set via JavaScript after hydration.
 * Googlebot renders JS, so dynamic tags are indexed correctly.
 * Social crawlers (Twitter, LinkedIn, Slack…) typically do NOT execute JS,
 * so the static fallbacks in index.html are used for link previews.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /**
   * Updates the page title, description, OG title/description, and html[lang].
   * Call this from each page component, reacting to language changes.
   *
   * @param title    - Localised page title (used for <title> and og:title)
   * @param description - Localised description (used for meta[name=description] and og:description)
   * @param lang     - Active language code ('fr' | 'en')
   */
  updateMeta(title: string, description: string, lang: string): void {
    this.titleService.setTitle(title);
    this.doc.documentElement.lang = lang;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
