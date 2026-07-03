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

  /**
   * Returns the featured article for the given language: the one flagged
   * `featured: true`, or the most recent one when none is pinned.
   */
  getFeatured(lang: 'fr' | 'en'): Article | undefined {
    const articles = this.getArticles(lang);
    return articles.find((article) => article.featured) ?? articles[0];
  }

  /**
   * Returns up to `count` related articles in the same language, ranked by the
   * number of shared tags (most-shared first), excluding the article itself.
   */
  getRelated(slug: string, lang: 'fr' | 'en', count = 2): Article[] {
    const current = this.getArticle(lang, slug);
    if (!current) return [];

    const currentTags = new Set(current.tags);

    return this.getArticles(lang)
      .filter((article) => article.slug !== slug)
      .map((article) => ({
        article,
        sharedTags: article.tags.filter((tag) => currentTags.has(tag)).length,
      }))
      .sort((a, b) => b.sharedTags - a.sharedTags)
      .slice(0, count)
      .map((entry) => entry.article);
  }
}
