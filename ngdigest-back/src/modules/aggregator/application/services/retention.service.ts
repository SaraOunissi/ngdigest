import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ResourceRepository } from '../../../resources/infrastructure/repositories/resource.repository.js';

const LOW_SCORE_MAX_AGE_DAYS = 14;
const MEDIUM_SCORE_MAX_AGE_DAYS = 60;

/**
 * Periodically archives stale resources based on their relevance score and age.
 * Runs every Monday at 03:00.
 *
 * Rules:
 * - score < 3  AND age > 14 days  → archived
 * - score 3-4  AND age > 60 days  → archived
 * - score >= 5 OR pinned = true   → never touched
 */
@Injectable()
export class RetentionService implements OnModuleInit {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  onModuleInit(): void {
    const job = CronJob.from({
      cronTime: '0 3 * * 1',
      onTick: () => {
        void this.cleanOldResources();
      },
      start: true,
    });

    this.schedulerRegistry.addCronJob('retention', job);
    this.logger.log('Retention cron scheduled: every Monday at 03:00');
  }

  /**
   * Archives stale resources according to the retention policy.
   */
  async cleanOldResources(): Promise<void> {
    this.logger.log('Retention cleanup started');

    const now = new Date();
    const lowScoreCutoff = new Date(
      now.getTime() - LOW_SCORE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    );
    const mediumScoreCutoff = new Date(
      now.getTime() - MEDIUM_SCORE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    );

    const archivedCount = await this.resourceRepository.archiveByRetentionRules(
      lowScoreCutoff,
      mediumScoreCutoff,
    );

    this.logger.log(
      `Retention cleanup complete — ${archivedCount} articles archived`,
    );
  }
}
