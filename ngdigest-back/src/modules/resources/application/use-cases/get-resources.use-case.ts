import { Injectable } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource, ScoreDetails } from '../../domain/entities/resource.entity.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';

export interface GetResourcesQuery {
  page?: number;
  limit?: number;
  source?: string;
  sort?: string;
  lang?: 'fr' | 'en' | 'all';
  search?: string;
}

/** Resource enriched with transient display flags (not persisted to DB). */
export type ResourceItem = Resource & { highlighted?: boolean };

/** Infers ScoreDetails from the numeric score for legacy documents without stored details. */
function inferScoreDetails(score: number): ScoreDetails {
  return {
    trustedSource: score >= 2,
    angularKeyword: score >= 4,
    isRecent: score >= 5,
  };
}

@Injectable()
export class GetResourcesUseCase {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  /**
   * Retrieves paginated and filtered resources.
   * When lang='fr', French resources are returned first and marked with highlighted=true.
   */
  async execute(
    query: GetResourcesQuery = {},
  ): Promise<{ items: ResourceItem[]; meta: ApiMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const lang = query.lang ?? 'all';

    const [rawItems, total] = await this.resourceRepository.findPaginated({
      page,
      limit,
      source: query.source,
      sort: query.sort ?? '-publishedAt',
      lang,
      search: query.search,
    });

    const items: ResourceItem[] = rawItems.map((item) => {
      const plain = (
        item as Resource & { toObject?: () => Resource }
      ).toObject?.() ?? (item as Resource);
      return {
        ...plain,
        scoreDetails: plain.scoreDetails ?? inferScoreDetails(plain.score),
        highlighted:
          lang === 'fr' && plain.language === 'fr' ? true : undefined,
      };
    });

    return {
      items,
      meta: { page, limit, total },
    };
  }
}
