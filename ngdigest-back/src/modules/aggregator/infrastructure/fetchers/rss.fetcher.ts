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
}

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
    url: 'https://blog.ninja-squad.fr/atom.xml',
    source: 'blog.ninja-squad.fr',
    language: 'en',
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
