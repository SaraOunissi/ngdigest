import { Injectable } from '@nestjs/common';
import { Resource } from '../../../resources/domain/entities/resource.entity.js';
import { TRUSTED_DOMAINS } from '../../infrastructure/config/trusted-sources.js';

const ANGULAR_KEYWORDS: readonly string[] = [
  'signal',
  'signals',
  'ssr',
  'standalone',
  'zoneless',
  'defer',
  'rxjs',
  'directive',
  'inject',
  'hydration',
  'lazy',
  'change detection',
  'control flow',
  'httpresource',
] as const;

const MIN_RELEVANCE_SCORE = 3;

/**
 * Scores articles for Angular relevance based on source reputation,
 * title keywords, and recency. Max score: 6.
 */
@Injectable()
export class RelevanceService {
  /**
   * Returns a relevance score for the given article:
   * - +3 if the source domain is in the trusted whitelist
   * - +2 if the title contains Angular-specific keywords
   * - +1 if the article was published within the last 7 days
   */
  scoreArticle(article: Partial<Resource>): number {
    let score = 0;

    if (this.isFromTrustedDomain(article.url)) score += 3;
    if (this.hasTitleKeywords(article.title)) score += 2;
    if (this.isRecent(article.publishedAt)) score += 1;

    return score;
  }

  isRelevant(article: Partial<Resource>): boolean {
    return this.scoreArticle(article) >= MIN_RELEVANCE_SCORE;
  }

  private isFromTrustedDomain(url: string | undefined): boolean {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return (TRUSTED_DOMAINS as readonly string[]).includes(hostname);
    } catch {
      return false;
    }
  }

  private hasTitleKeywords(title: string | undefined): boolean {
    if (!title) return false;
    const lowerTitle = title.toLowerCase();
    return ANGULAR_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
  }

  private isRecent(date: Date | undefined): boolean {
    if (!date) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date > sevenDaysAgo;
  }
}
