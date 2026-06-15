import { Injectable, Logger } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { isLikelyArticle } from '../../../aggregator/infrastructure/config/is-article-candidate.js';

@Injectable()
export class PurgeNonArticlesUseCase {
  private readonly logger = new Logger(PurgeNonArticlesUseCase.name);

  constructor(private readonly resourceRepository: ResourceRepository) {}

  /**
   * Archives every active resource whose URL/title looks like a listing or
   * navigation page rather than an article (e.g. the Angular blog "Latest" tab).
   * Use after deploying the non-article guard to retire pages that were stored
   * before it existed. Reversible: archived rows keep their data, they are just
   * hidden from the digest.
   */
  async execute(): Promise<{ archived: number; total: number }> {
    const resources = await this.resourceRepository.findAll();

    const idsToArchive = resources
      .filter((resource) => resource.archivedAt === null)
      .filter((resource) => !isLikelyArticle(resource.url, resource.title))
      .map((resource) => resource._id.toString());

    const archived = await this.resourceRepository.archiveByIds(idsToArchive);
    this.logger.log(
      `Purge non-articles: ${archived}/${resources.length} archived`,
    );

    return { archived, total: resources.length };
  }
}
