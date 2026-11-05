import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { localizeRoutePath, translateRoutePath } from '../i18n/route-slugs';

const BASE_URL = environment.baseUrl;
/** Image de partage par défaut (index.html) ; une page peut la remplacer via `updateImage`. */
const DEFAULT_SHARE_IMAGE = 'https://ngdigest.co/assets/images/ngdigest-logo.png';

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
    // Canonical = the slug that matches the page language. Each career/catalog
    // page is reachable under both slugs in both languages (/en/carriere/…,
    // /fr/career/…); without this, Google sees four self-canonical duplicates.
    const pageUrl = `${BASE_URL}${localizeRoutePath(this.doc.location.pathname, lang)}`;

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
    // Chaque page repart de l'image par défaut : pas d'image d'article qui « colle »
    // lors d'une navigation interne vers une autre page.
    this.updateImage(DEFAULT_SHARE_IMAGE);

    this.setLinkTag('canonical', pageUrl);
    this.setLinkTag('alternate', pageUrl, lang);
    this.setLinkTag('alternate', alternateUrl, alternateLang);
    this.setLinkTag('alternate', `${BASE_URL}/fr`, 'x-default');
  }

  /** Image de partage (Open Graph + Twitter), URL absolue ou chemin du site. */
  updateImage(url: string, alt?: string): void {
    const absolute = url.startsWith('http') ? url : `https://ngdigest.co${url}`;
    this.meta.updateTag({ property: 'og:image', content: absolute });
    this.meta.updateTag({ name: 'twitter:image', content: absolute });
    if (alt) {
      this.meta.updateTag({ property: 'og:image:alt', content: alt });
      this.meta.updateTag({ name: 'twitter:image:alt', content: alt });
    } else {
      this.meta.removeTag('property="og:image:alt"');
      this.meta.removeTag('name="twitter:image:alt"');
    }
  }

  /**
   * Injects or updates a JSON-LD `<script>` in `<head>` with the given id.
   * With SSR the structured data is part of the server-rendered HTML, so it is
   * crawlable without JavaScript (e.g. FAQPage for the interview page).
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
