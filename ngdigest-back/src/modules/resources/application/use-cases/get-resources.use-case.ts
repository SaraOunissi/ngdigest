import { Injectable } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource } from '../../domain/entities/resource.entity.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';

export interface GetResourcesQuery {
  page?: number;
  limit?: number;
  source?: string;
  sort?: string;
  lang?: 'fr' | 'en' | 'all';
}

/** Resource enriched with a `highlighted` flag (not persisted to DB). */
export type ResourceItem = Resource & { highlighted?: boolean };

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
    });

    const items: ResourceItem[] = rawItems.map((item) => {
      const plain = (
        item as Resource & { toObject?: () => Resource }
      ).toObject?.() ?? (item as Resource);
      return {
        ...plain,
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
