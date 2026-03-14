import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getJson } from 'serpapi';
import { Resource } from '../../../resources/domain/entities/resource.entity.js';
import { detectLanguage } from '../config/language-detector.js';

interface OrganicResult {
  title?: string;
  link?: string;
  date?: string;
}

interface GoogleSearchResponse {
  organic_results?: OrganicResult[];
}

/**
 * Fetches Angular-related resources from SerpAPI using three targeted Google searches.
 * At cron "0 *\/8 * * *" (3 runs/day) this uses ~270 req/month (free plan limit: 250).
 * Switch to "0 *\/12 * * *" (180 req/month) to stay safely within the free plan.
 */
@Injectable()
export class SerpapiNewsFetcher {
  private readonly logger = new Logger(SerpapiNewsFetcher.name);

  constructor(private readonly configService: ConfigService) {}

  async fetch(): Promise<Partial<Resource>[]> {
    const apiKey = this.configService.get<string>('serpapi.apiKey', '');

    const [frameworkResults, communityResults, frenchResults] =
      await Promise.all([
        this.fetchRecentFrameworkSearch(apiKey),
        this.fetchCommunitySearch(apiKey),
        this.fetchFrenchCommunitySearch(apiKey),
      ]);

    return [...frameworkResults, ...communityResults, ...frenchResults];
  }

  /**
   * Searches for recent Angular framework content from the past week.
   */
  private async fetchRecentFrameworkSearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const currentYear = new Date().getFullYear();
    const query = `"Angular framework" ${currentYear} -AngularJS`;

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
        tbs: 'qdr:w',
        num: 10,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];
      this.logger.log(`framework search: ${items.length} results fetched`);

      return items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => {
          if (!item.date) {
            this.logger.warn(
              `framework search: no date for "${item.title}" — falling back to current date`,
            );
          }
          return {
            title: item.title ?? '',
            url: item.link ?? '',
            source: this.extractDomain(item.link),
            publishedAt: item.date ? new Date(item.date) : new Date(),
            tags: ['angular', 'framework'],
            language: detectLanguage(item.link, item.title),
            score: 0,
            isRead: false,
            isFavorite: false,
          };
        });
    } catch (error) {
      this.logger.error('Failed to fetch framework search', error);
      return [];
    }
  }

  /**
   * Searches for Angular content on trusted English community sites.
   */
  private async fetchCommunitySearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const query =
      '"Angular" Signals OR SSR OR "standalone" site:dev.to OR site:medium.com OR site:indepth.dev';

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
        num: 10,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];
      this.logger.log(`community search: ${items.length} results fetched`);

      return items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => {
          if (!item.date) {
            this.logger.warn(
              `community search: no date for "${item.title}" — falling back to current date`,
            );
          }
          return {
            title: item.title ?? '',
            url: item.link ?? '',
            source: this.extractDomain(item.link),
            publishedAt: item.date ? new Date(item.date) : new Date(),
            tags: ['angular', 'community'],
            language: detectLanguage(item.link, item.title),
            score: 0,
            isRead: false,
            isFavorite: false,
          };
        });
    } catch (error) {
      this.logger.error('Failed to fetch community search', error);
      return [];
    }
  }

  /**
   * Searches for Angular content on French community sites.
   * Results are explicitly classified as language: 'fr'.
   */
  private async fetchFrenchCommunitySearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const query =
      '"Angular" site:dev.to OR site:medium.com OR site:grafikart.fr OR site:jesuisundev.com';

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'fr',
        gl: 'fr',
        num: 10,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];
      this.logger.log(
        `french community search: ${items.length} results fetched`,
      );

      return items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => {
          if (!item.date) {
            this.logger.warn(
              `french community search: no date for "${item.title}" — falling back to current date`,
            );
          }
          // Use combined URL + title detection: articles from dev.to/medium included in
          // this search may be English even though the search targets French results.
          return {
            title: item.title ?? '',
            url: item.link ?? '',
            source: this.extractDomain(item.link),
            publishedAt: item.date ? new Date(item.date) : new Date(),
            tags: ['angular', 'french'],
            language: detectLanguage(item.link, item.title),
            score: 0,
            isRead: false,
            isFavorite: false,
          };
        });
    } catch (error) {
      this.logger.error('Failed to fetch french community search', error);
      return [];
    }
  }

  private extractDomain(url: string | undefined): string {
    if (!url) return 'Google Search';
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'Google Search';
    }
  }
}
