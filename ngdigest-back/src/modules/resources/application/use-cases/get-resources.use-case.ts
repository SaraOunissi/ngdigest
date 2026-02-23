import { Injectable } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource } from '../../domain/entities/resource.entity.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';

export interface GetResourcesQuery {
  page?: number;
  limit?: number;
  source?: string;
  sort?: string;
}

@Injectable()
export class GetResourcesUseCase {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  /**
   * Retrieves paginated and filtered resources.
   */
  async execute(
    query: GetResourcesQuery = {},
  ): Promise<{ items: Resource[]; meta: ApiMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.resourceRepository.findPaginated({
      page,
      limit,
      source: query.source,
      sort: query.sort ?? '-publishedAt',
    });

    return {
      items,
      meta: { page, limit, total },
    };
  }
}
