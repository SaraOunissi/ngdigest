import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Resource,
  ResourceLanguage,
} from '../../../resources/domain/entities/resource.entity.js';
import { detectLanguage } from '../config/language-detector.js';

const DEVTO_API_URL =
  'https://dev.to/api/articles?tag=angular&per_page=20&top=7';

interface DevtoArticle {
  title: string;
  url: string;
  published_at: string;
  tag_list: string[];
  /** ISO language tag returned by the Dev.to API (e.g. "en", "fr"). */
  language?: string;
  /** Alternative language field present on some Dev.to API responses. */
  language_code?: string;
}

/**
 * Fetches Angular-related articles from the public Dev.to API.
 * No API key required. Enabled via DEV_TO_ENABLED=true.
 */
@Injectable()
export class DevtoFetcher {
  private readonly logger = new Logger(DevtoFetcher.name);

  constructor(private readonly configService: ConfigService) {}

  async fetch(): Promise<Partial<Resource>[]> {
    const enabled = this.configService.get<string>('DEV_TO_ENABLED', 'false');

    if (enabled !== 'true') {
      this.logger.log('Dev.to fetcher is disabled (DEV_TO_ENABLED != true)');
      return [];
    }

    try {
      const response = await fetch(DEVTO_API_URL, {
        headers: { 'User-Agent': 'NgDigest/1.0' },
      });

      if (!response.ok) {
        throw new Error(
          `Dev.to API responded with status ${response.status}`,
        );
      }

      const articles = (await response.json()) as DevtoArticle[];
      this.logger.log(`Dev.to: ${articles.length} articles fetched`);

      return articles
        .filter((article) => Boolean(article.title) && Boolean(article.url))
        .map((article) => ({
          title: article.title,
          url: article.url,
          source: 'dev.to',
          publishedAt: new Date(article.published_at),
          tags: [
            'angular',
            'devto',
            ...article.tag_list.filter((tag) => tag !== 'angular'),
          ],
          language: ((): ResourceLanguage => {
            const declaredLang = article.language_code ?? article.language;
            // Trust Dev.to's declared language: keep fr/en, route every other
            // language (pt, es, de…) to 'unknown' so it is filtered out.
            // Previously any non-'fr' language was coerced to 'en', which let
            // Portuguese/Spanish articles leak into the digest.
            if (declaredLang === 'fr') return 'fr';
            if (declaredLang === 'en') return 'en';
            if (declaredLang) return 'unknown';
            // Dev.to declared nothing — fall back to the title heuristic.
            return detectLanguage(article.url, article.title);
          })(),
          score: 0,
          isRead: false,
          isFavorite: false,
        }));
    } catch (error) {
      this.logger.error('Failed to fetch from Dev.to', error);
      return [];
    }
  }
}
