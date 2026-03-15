import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ResourceRepository } from '../../../resources/infrastructure/repositories/resource.repository.js';
import { DevtoFetcher } from '../../infrastructure/fetchers/devto.fetcher.js';
import { SerpapiNewsFetcher } from '../../infrastructure/fetchers/serpapi.fetcher.js';
import { RelevanceService } from './relevance.service.js';

/**
 * Orchestrates periodic resource aggregation via a configurable cron job.
 * The cron expression is read from AGGREGATOR_CRON at startup (default: every 6 hours).
 */
@Injectable()
export class AggregationService implements OnModuleInit {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly serpapiNewsFetcher: SerpapiNewsFetcher,
    private readonly devtoFetcher: DevtoFetcher,
    private readonly resourceRepository: ResourceRepository,
    private readonly relevanceService: RelevanceService,
  ) {}

  onModuleInit(): void {
    const cronExpression = this.configService.get<string>(
      'AGGREGATOR_CRON',
      '0 */6 * * *',
    );

    const job = CronJob.from({
      cronTime: cronExpression,
      onTick: () => {
        void this.runAggregation();
      },
      start: true,
    });

    this.schedulerRegistry.addCronJob('aggregation', job);
    this.logger.log(`Aggregation cron scheduled: ${cronExpression}`);
  }

  /**
   * Fetches candidates, scores them for relevance, and stores only articles
   * with a score >= 3.
   */
  async runAggregation(): Promise<void> {
    this.logger.log('Aggregation started');

    const [serpapiResults, devtoResults] = await Promise.all([
      this.serpapiNewsFetcher.fetch(),
      this.devtoFetcher.fetch(),
    ]);

    const allCandidates = [...serpapiResults, ...devtoResults];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const now = new Date();

    const candidates = allCandidates.filter((article) => {
      if (!article.publishedAt) return false; // reject articles with no date
      return article.publishedAt >= sixMonthsAgo && article.publishedAt <= now;
    });

    if (candidates.length < allCandidates.length) {
      this.logger.log(
        `Date filter: ${allCandidates.length - candidates.length} article(s) rejected (no date, older than 6 months, or future date)`,
      );
    }

    const relevant = candidates
      .map((article) => {
        const scoreDetails = this.relevanceService.getScoreDetails(article);
        const score =
          (scoreDetails.trustedSource ? 3 : 0) +
          (scoreDetails.angularKeyword ? 2 : 0) +
          (scoreDetails.isRecent ? 1 : 0);
        return { ...article, score, scoreDetails };
      })
      .filter((article) => this.relevanceService.isRelevant(article));

    for (const resource of relevant) {
      await this.resourceRepository.upsertByUrl(resource);
    }

    this.logger.log(
      `Aggregation complete — ${relevant.length}/${candidates.length} items stored (score >= 3)`,
    );
  }
}
