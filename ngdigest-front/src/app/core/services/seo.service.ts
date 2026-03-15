import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const BASE_URL = 'https://ngdigest.co';

/**
 * Centralises all SEO concerns: page title, meta description, OG tags,
 * hreflang alternates, and canonical URL.
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
   * Updates the page title, description, OG/Twitter tags, canonical URL,
   * hreflang alternates, and html[lang].
   * Call this from each page component, reacting to language changes.
   *
   * @param title       - Localised page title
   * @param description - Localised description
   * @param lang        - Active language code ('fr' | 'en')
   */
  updateMeta(title: string, description: string, lang: 'fr' | 'en'): void {
    this.titleService.setTitle(title);
    this.doc.documentElement.lang = lang;

    const locale = lang === 'fr' ? 'fr_FR' : 'en_US';
    const alternateLocale = lang === 'fr' ? 'en_US' : 'fr_FR';
    const pageUrl = `${BASE_URL}${this.doc.location.pathname}`;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    this.meta.updateTag({ property: 'og:locale:alternate', content: alternateLocale });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.setLinkTag('canonical', pageUrl);
    this.setLinkTag('alternate', pageUrl, 'fr');
    this.setLinkTag('alternate', pageUrl, 'en');
    this.setLinkTag('alternate', pageUrl, 'x-default');
  }

  /** Creates or updates a <link> element in <head>. */
  private setLinkTag(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`;

    let link = this.doc.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) {
        link.setAttribute('hreflang', hreflang);
      }
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
