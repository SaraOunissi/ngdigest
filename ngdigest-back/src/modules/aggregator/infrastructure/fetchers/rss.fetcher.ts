import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import {
  Resource,
  ResourceLanguage,
} from '../../../resources/domain/entities/resource.entity.js';

interface RssFeedConfig {
  readonly url: string;
  readonly source: string;
  readonly language: ResourceLanguage;
  /**
   * Optional title filter for multi-topic sites.
   * When provided, only items whose title matches are kept.
   * Use for generalist blogs (e.g. grafikart) that mix Angular with other topics.
   */
  readonly titleFilter?: RegExp;
}

/**
 * Loose Angular-ecosystem matcher for generalist FR tech blogs.
 * Includes Angular core concepts that strongly imply Angular content even
 * when the word "angular" isn't in the title (e.g. "Découvrir les Signals").
 * Accepts a bit of cross-contamination (Signals exist in SolidJS/Vue 3.5+) in
 * exchange for catching articles that the strict /angular/ filter would drop.
 */
const ANGULAR_ECOSYSTEM_RE =
  /\b(angular|signals?|rxjs|standalone|zoneless|ng[\s-]?rx|nx workspace)\b/i;

/**
 * List of RSS/Atom feeds to poll.
 * These provide accurate publication dates unlike Google Search indexing.
 * Add new feeds here as you discover them — failed feeds are skipped silently.
 */
const RSS_FEEDS: readonly RssFeedConfig[] = [
  // Angular official
  {
    url: 'https://blog.angular.dev/feed',
    source: 'blog.angular.dev',
    language: 'en',
  },
  // Expert blogs EN
  {
    url: 'https://blog.ninja-squad.com/atom.xml',
    source: 'blog.ninja-squad.com',
    language: 'en',
  },
  // French community — generalist sites filtered to Angular-ecosystem articles
  {
    url: 'https://grafikart.fr/feed.rss',
    source: 'grafikart.fr',
    language: 'fr',
    titleFilter: ANGULAR_ECOSYSTEM_RE,
  },
  {
    url: 'https://www.jesuisundev.com/feed/',
    source: 'jesuisundev.com',
    language: 'fr',
    titleFilter: ANGULAR_ECOSYSTEM_RE,
  },
  {
    url: 'https://la-cascade.io/rss/feed.xml',
    source: 'la-cascade.io',
    language: 'fr',
    titleFilter: ANGULAR_ECOSYSTEM_RE,
  },
  {
    url: 'https://putaindecode.io/api/articles/feeds/desc/feed.xml',
    source: 'putaindecode.io',
    language: 'fr',
    titleFilter: ANGULAR_ECOSYSTEM_RE,
  },
  // Liksi tech blog — multi-topic, filter to Angular ecosystem
  {
    url: 'https://blog.liksi.io/index.xml',
    source: 'blog.liksi.io',
    language: 'fr',
    titleFilter: ANGULAR_ECOSYSTEM_RE,
  },
  // angulardev.fr — 100% Angular, WordPress /feed/ pattern guessed.
  // Homepage returns 429 anti-bot from our IP, so unverifiable from local.
  // If the URL is wrong or blocked in prod, Promise.allSettled drops it silently.
  {
    url: 'https://angulardev.fr/feed/',
    source: 'angulardev.fr',
    language: 'fr',
  },
];

/**
 * Fetches Angular-related articles from curated RSS/Atom feeds.
 * Uses Promise.allSettled so a broken feed never blocks the others.
 */
@Injectable()
export class RssFetcher {
  private readonly logger = new Logger(RssFetcher.name);
  private readonly parser = new Parser({ timeout: 10_000 });

  async fetch(): Promise<Partial<Resource>[]> {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((feed) => this.fetchFeed(feed)),
    );

    const allItems: Partial<Resource>[] = [];
    let successCount = 0;

    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
        successCount++;
      } else {
        this.logger.error(
          `RSS [${RSS_FEEDS[index].source}]: failed — ${String(result.reason)}`,
        );
      }
    }

    this.logger.log(
      `RSS: ${allItems.length} articles from ${successCount}/${RSS_FEEDS.length} feeds`,
    );
    return allItems;
  }

  private async fetchFeed(config: RssFeedConfig): Promise<Partial<Resource>[]> {
    const feed = await this.parser.parseURL(config.url);
    return feed.items
      .filter((item) => Boolean(item.title) && Boolean(item.link))
      .filter((item) => !config.titleFilter || config.titleFilter.test(item.title ?? ''))
      .map((item) => ({
        title: item.title ?? '',
        url: item.link ?? '',
        source: config.source,
        publishedAt: item.isoDate
          ? new Date(item.isoDate)
          : item.pubDate
            ? new Date(item.pubDate)
            : null,
        tags: ['angular'],
        language: config.language,
        score: 0,
        isRead: false,
        isFavorite: false,
      }));
  }
}
