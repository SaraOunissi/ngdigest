import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import {
  Resource,
  ResourceDocument,
  ResourceLanguage,
} from '../../domain/entities/resource.entity.js';

export interface PaginatedQuery {
  page: number;
  limit: number;
  source?: string;
  sort: string;
  lang?: 'fr' | 'en' | 'all';
  search?: string;
}

@Injectable()
export class ResourceRepository {
  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
  ) {}

  /**
   * Returns a paginated list of active (non-archived) resources with total count.
   * When lang='fr', French resources are returned first via aggregation.
   * When lang='en', only English resources are returned.
   * When lang='all' (default), all languages are returned.
   */
  async findPaginated(
    query: PaginatedQuery,
  ): Promise<[Resource[], number]> {
    const filter: Record<string, unknown> = { archivedAt: null };

    if (query.source) {
      filter['source'] = query.source;
    }

    if (query.lang === 'en') {
      filter['language'] = 'en';
    } else {
      // Always exclude non-EN/FR articles regardless of the lang filter
      filter['language'] = { $ne: 'unknown' };
    }

    if (query.search) {
      filter['$or'] = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sort.startsWith('-')
      ? query.sort.slice(1)
      : query.sort;
    const sortDirection: SortOrder = query.sort.startsWith('-') ? -1 : 1;

    const skip = (query.page - 1) * query.limit;

    if (query.lang === 'fr') {
      return this.findPaginatedFrFirst(
        filter,
        sortField,
        sortDirection as number,
        skip,
        query.limit,
      );
    }

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

  /**
   * Uses MongoDB aggregation to return French resources first,
   * followed by other languages, within the requested page/limit.
   */
  private async findPaginatedFrFirst(
    filter: Record<string, unknown>,
    sortField: string,
    sortDirection: number,
    skip: number,
    limit: number,
  ): Promise<[Resource[], number]> {
    const [items, total] = await Promise.all([
      this.resourceModel
        .aggregate([
          { $match: filter },
          {
            $addFields: {
              _langPriority: {
                $cond: [{ $eq: ['$language', 'fr'] }, 0, 1],
              },
            },
          },
          { $sort: { [sortField]: sortDirection as 1 | -1, _langPriority: 1 as 1 } },
          { $skip: skip },
          { $limit: limit },
          { $unset: '_langPriority' },
        ])
        .exec(),
      this.resourceModel.countDocuments(filter).exec(),
    ]);

    return [items as Resource[], total];
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findById(id).exec();
  }

  /**
   * Returns all resources (including archived) for bulk operations.
   */
  async findAll(): Promise<ResourceDocument[]> {
    return this.resourceModel.find({}).exec();
  }

  /**
   * Bulk-updates the language field for the given resource IDs.
   */
  async bulkUpdateLanguages(
    updates: { id: string; language: ResourceLanguage }[],
  ): Promise<void> {
    if (updates.length === 0) return;
    await this.resourceModel.bulkWrite(
      updates.map(({ id, language }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { language } },
        },
      })),
    );
  }

  /**
   * Inserts a resource if its URL does not already exist (no-op on duplicate).
   */
  async upsertByUrl(data: Partial<Resource>): Promise<void> {
    await this.resourceModel
      .findOneAndUpdate(
        { url: data.url },
        { $setOnInsert: data },
        { upsert: true },
      )
      .exec();
  }

  /**
   * Archives resources matching the retention rules by setting archivedAt = now.
   * Never touches pinned resources or those with score >= 5.
   *
   * @param lowScoreCutoff  - Articles with score < 3 published before this date are archived.
   * @param mediumScoreCutoff - Articles with score 3-4 published before this date are archived.
   * @returns Number of archived documents.
   */
  async archiveByRetentionRules(
    lowScoreCutoff: Date,
    mediumScoreCutoff: Date,
  ): Promise<number> {
    const result = await this.resourceModel
      .updateMany(
        {
          pinned: { $ne: true },
          score: { $lt: 5 },
          archivedAt: null,
          $or: [
            { score: { $lt: 3 }, publishedAt: { $lt: lowScoreCutoff } },
            {
              score: { $gte: 3, $lte: 4 },
              publishedAt: { $lt: mediumScoreCutoff },
            },
          ],
        },
        { $set: { archivedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount;
  }
}
