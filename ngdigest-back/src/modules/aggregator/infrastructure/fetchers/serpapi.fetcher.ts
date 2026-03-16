import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getJson } from 'serpapi';
import { Resource } from '../../../resources/domain/entities/resource.entity.js';
import { detectLanguage } from '../config/language-detector.js';

interface OrganicResult {
  title?: string;
  link?: string;
  date?: string;
  snippet?: string;
  /** Medium shows "960+ likes · 1 year ago" — the relative date is after the · */
  displayed_link?: string;
}

interface GoogleSearchResponse {
  organic_results?: OrganicResult[];
}

/**
 * Tries to parse a date string from SerpAPI, which can be:
 *  - An absolute date:  "Nov 19, 2025" / "November 19, 2025" / "2025-11-19"
 *  - A relative date:   "3 days ago" / "2 months ago" / "1 year ago"
 * Returns null when the string cannot be interpreted.
 */
function parseFlexibleDate(raw: string): Date | null {
  // 1. Try direct JS parse (handles ISO 8601 and most absolute English formats)
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct;

  // 2. Relative dates: "N day(s)|week(s)|month(s)|year(s) ago"
  const relativeMatch = /(\d+)\s+(day|week|month|year)s?\s+ago/i.exec(raw);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    const date = new Date();
    switch (unit) {
      case 'day':   date.setDate(date.getDate() - amount);         break;
      case 'week':  date.setDate(date.getDate() - amount * 7);     break;
      case 'month': date.setMonth(date.getMonth() - amount);       break;
      case 'year':  date.setFullYear(date.getFullYear() - amount); break;
    }
    return date;
  }

  return null;
}

/**
 * Tries to extract a publication date from a SerpAPI snippet.
 * Some blogs start their snippet with the publication date:
 *   "Oct 8, 2025 · Article content..."
 *   "Oct 8, 2025 — Article content..."
 * Note: most Google organic results do NOT include dates in snippets.
 */
function extractDateFromSnippet(snippet: string): Date | null {
  const match = /^([A-Z][a-z]{2,8}\.?\s+\d{1,2},?\s+\d{4})\s*[·—\s]/u.exec(snippet);
  if (!match) return null;
  const date = new Date(match[1].replace('.', ''));
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Tries to extract a publication date from the displayed_link field.
 * Medium returns e.g. "960+ likes · 1 year ago" — the relative date is after the ·.
 * Other sources may use different separators or formats.
 */
function extractDateFromDisplayedLink(displayedLink: string): Date | null {
  for (const part of displayedLink.split(/[·|]/)) {
    const date = parseFlexibleDate(part.trim());
    if (date) return date;
  }
  return null;
}

/**
 * Tries to extract a publication date from a URL path.
 * Blog posts commonly embed their date in the path: /2024/05/22/article or /2024/05/article.
 * Returns null for undated paths like /formations/angularjs or /docs/components.
 */
function extractDateFromUrl(url: string): Date | null {
  try {
    const pathname = new URL(url).pathname;
    const match = /\/(\d{4})\/(\d{1,2})(?:\/(\d{1,2}))?(?:\/|$)/.exec(pathname);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = match[3] ? parseInt(match[3], 10) : 1;
    if (year < 2015 || year > 2030 || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Resolves the best available publication date for a SerpAPI organic result.
 * Tries in order: date field → snippet prefix → displayed_link → URL path pattern.
 * Returns null if no date can be determined — callers should reject dateless articles.
 */
function resolvePublishedAt(item: OrganicResult): Date | null {
  if (item.date) {
    const fromDate = parseFlexibleDate(item.date);
    if (fromDate) return fromDate;
  }
  if (item.snippet) {
    const fromSnippet = extractDateFromSnippet(item.snippet);
    if (fromSnippet) return fromSnippet;
  }
  if (item.displayed_link) {
    const fromLink = extractDateFromDisplayedLink(item.displayed_link);
    if (fromLink) return fromLink;
  }
  if (item.link) {
    const fromUrl = extractDateFromUrl(item.link);
    if (fromUrl) return fromUrl;
  }
  return null;
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

    const [expertBlogResults, communityResults, frenchResults] =
      await Promise.all([
        this.fetchExpertBlogsSearch(apiKey),
        this.fetchCommunitySearch(apiKey),
        this.fetchFrenchCommunitySearch(apiKey),
      ]);

    return [...expertBlogResults, ...communityResults, ...frenchResults];
  }

  /**
   * Searches Angular expert blogs for recent articles.
   * Targets Angular-specific authors and official sources — no job boards.
   */
  private async fetchExpertBlogsSearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const query =
      'Angular site:blog.angular.dev OR site:netbasal.com OR site:ultimatecourses.com OR site:angular-university.io OR site:indepth.dev OR site:ninja-squad.com OR site:angular.love';

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
        tbs: 'qdr:m',
        num: 10,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];
      const mapped = items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => ({
          title: item.title ?? '',
          url: item.link ?? '',
          source: this.extractDomain(item.link),
          publishedAt: resolvePublishedAt(item),
          tags: ['angular', 'expert'],
          language: detectLanguage(item.link, item.title, item.snippet),
          score: 0,
          isRead: false,
          isFavorite: false,
        }));

      const withDate = mapped.filter((item) => item.publishedAt !== null);
      this.logger.log(
        `SerpAPI [expert-blogs]: ${mapped.length} results, ${withDate.length} with date`,
      );
      return mapped;
    } catch (error) {
      this.logger.error('Failed to fetch expert blogs search', error);
      return [];
    }
  }

  /**
   * Searches for Angular content on trusted English community platforms.
   * Dev.to is intentionally excluded — already covered by DevtoFetcher.
   */
  private async fetchCommunitySearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const query =
      'Angular Signals OR SSR OR standalone OR zoneless site:medium.com OR site:hashnode.com OR site:betterprogramming.pub OR site:indepth.dev';

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
        num: 10,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];

      const mapped = items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => ({
          title: item.title ?? '',
          url: item.link ?? '',
          source: this.extractDomain(item.link),
          publishedAt: resolvePublishedAt(item),
          tags: ['angular', 'community'],
          language: detectLanguage(item.link, item.title, item.snippet),
          score: 0,
          isRead: false,
          isFavorite: false,
        }));

      const withDate = mapped.filter((item) => item.publishedAt !== null);
      this.logger.log(
        `SerpAPI [community]: ${mapped.length} results, ${withDate.length} with date`,
      );
      return mapped;
    } catch (error) {
      this.logger.error('Failed to fetch community search', error);
      return [];
    }
  }

  /**
   * Searches for Angular content on French community sites.
   * Uses tbs:qdr:3m (3 months) since small FR sites publish infrequently.
   * Articles without any parseable date (SerpAPI field, snippet, or URL path) are left
   * with publishedAt=null and will be rejected by the aggregation date filter — this
   * prevents stale evergreen content (docs, tutorials, courses) from slipping through.
   */
  private async fetchFrenchCommunitySearch(
    apiKey: string,
  ): Promise<Partial<Resource>[]> {
    const query =
      'Angular site:grafikart.fr OR site:jesuisundev.com OR site:bonjour-angular.com OR site:devtobecurious.fr OR site:angulardevs.fr OR site:easyangularkit.com';

    try {
      const response = (await getJson('google', {
        q: query,
        api_key: apiKey,
        hl: 'fr',
        gl: 'fr',
        tbs: 'qdr:3m',
        num: 20,
      })) as GoogleSearchResponse;

      const items = response.organic_results ?? [];
      const mapped = items
        .filter((item) => Boolean(item.title) && Boolean(item.link))
        .map((item) => ({
          title: item.title ?? '',
          url: item.link ?? '',
          source: this.extractDomain(item.link),
          publishedAt: resolvePublishedAt(item),
          tags: ['angular', 'french'],
          language: detectLanguage(item.link, item.title, item.snippet),
          score: 0,
          isRead: false,
          isFavorite: false,
        }));

      const withDate = mapped.filter((item) => item.publishedAt !== null);
      this.logger.log(
        `SerpAPI [french]: ${mapped.length} results, ${withDate.length} with date`,
      );
      return mapped;
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
