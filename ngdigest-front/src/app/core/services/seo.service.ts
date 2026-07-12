import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { translateRoutePath } from '../i18n/route-slugs';

const BASE_URL = environment.baseUrl;

/**
 * Centralises all SEO concerns: page title, meta description, OG tags,
 * hreflang alternates, and canonical URL.
 * Also keeps the `<html lang>` attribute in sync with the active language.
 *
 * With SSR, all tags are injected into the server-rendered HTML, so they are
 * visible to Google and social crawlers without JavaScript execution.
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
   * @param title              - Localised page title
   * @param description        - Localised description
   * @param lang               - Active language code ('fr' | 'en')
   * @param explicitAlternateUrl - Full alternate-language URL for dynamic slugs
   *                              that cannot be derived statically (e.g. blog
   *                              posts). When omitted, the alternate URL is
   *                              derived from the current path via the shared
   *                              slug map, which also translates the slug (e.g.
   *                              /fr/carriere/guide → /en/career/guide).
   */
  updateMeta(
    title: string,
    description: string,
    lang: 'fr' | 'en',
    explicitAlternateUrl?: string,
  ): void {
    this.titleService.setTitle(title);
    this.doc.documentElement.lang = lang;

    const locale = lang === 'fr' ? 'fr_FR' : 'en_US';
    const alternateLang: 'fr' | 'en' = lang === 'fr' ? 'en' : 'fr';
    const pageUrl = `${BASE_URL}${this.doc.location.pathname}`;

    // Derive the alternate-language URL from the current path, translating the
    // slug when it differs between languages (carriere↔career, ressources↔
    // resources, …). An explicit URL wins for dynamic slugs (e.g. blog posts).
    const alternateUrl =
      explicitAlternateUrl ??
      `${BASE_URL}${translateRoutePath(this.doc.location.pathname, alternateLang)}`;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    this.meta.updateTag({ property: 'og:locale:alternate', content: lang === 'fr' ? 'en_US' : 'fr_FR' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.setLinkTag('canonical', pageUrl);
    this.setLinkTag('alternate', pageUrl, lang);
    this.setLinkTag('alternate', alternateUrl, alternateLang);
    this.setLinkTag('alternate', `${BASE_URL}/fr`, 'x-default');
  }

  /**
   * Injects or updates a JSON-LD `<script>` in `<head>` with the given id.
   * With SSR the structured data is part of the server-rendered HTML, so it is
   * crawlable without JavaScript (e.g. QAPage for the interview page).
   */
  setJsonLd(id: string, data: unknown): void {
    let script = this.doc.head.querySelector<HTMLScriptElement>(
      `script#${id}[type="application/ld+json"]`,
    );
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
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
