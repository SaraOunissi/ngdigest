import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import {
  Resource,
  ResourceDocument,
} from '../../domain/entities/resource.entity.js';

export interface PaginatedQuery {
  page: number;
  limit: number;
  source?: string;
  sort: string;
}

@Injectable()
export class ResourceRepository {
  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
  ) {}

  /**
   * Returns a paginated list of resources with total count.
   */
  async findPaginated(
    query: PaginatedQuery,
  ): Promise<[Resource[], number]> {
    const filter: Record<string, string> = {};

    if (query.source) {
      filter['source'] = query.source;
    }

    const sortField = query.sort.startsWith('-')
      ? query.sort.slice(1)
      : query.sort;
    const sortDirection: SortOrder = query.sort.startsWith('-') ? -1 : 1;

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.resourceModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.resourceModel.countDocuments(filter).exec(),
    ]);

    return [items, total];
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findById(id).exec();
  }
}
