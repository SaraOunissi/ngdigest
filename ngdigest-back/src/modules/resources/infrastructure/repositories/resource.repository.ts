import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Resource,
  ResourceDocument,
} from '../../domain/entities/resource.entity.js';

@Injectable()
export class ResourceRepository {
  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
  ) {}

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().sort({ publishedAt: -1 }).exec();
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findById(id).exec();
  }
}
