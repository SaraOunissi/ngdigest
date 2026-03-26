import { Injectable } from '@angular/core';

import { Article } from '../domain/models/article.model';
import { BLOG_DATA } from './blog-data.generated';

/**
 * Provides access to blog articles loaded from Markdown files at build time.
 * No HTTP calls — all data is embedded in the bundle via the generate script.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  /**
   * Returns all articles for the given language, sorted newest-first.
   */
  getArticles(lang: 'fr' | 'en'): Article[] {
    return BLOG_DATA.filter((article) => article.lang === lang).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  /**
   * Returns a single article by language and slug, or undefined if not found.
   */
  getArticle(lang: 'fr' | 'en', slug: string): Article | undefined {
    return BLOG_DATA.find((article) => article.lang === lang && article.slug === slug);
  }
}
