import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Resource,
  ResourceSchema,
} from './domain/entities/resource.entity.js';
import { ResourceRepository } from './infrastructure/repositories/resource.repository.js';
import { GetResourcesUseCase } from './application/use-cases/get-resources.use-case.js';
import { ResourceController } from './presentation/controllers/resource.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
    ]),
  ],
  controllers: [ResourceController],
  providers: [ResourceRepository, GetResourcesUseCase],
  exports: [ResourceRepository],
})
export class ResourcesModule {}
