import { Controller, Get, Query } from '@nestjs/common';
import { GetResourcesUseCase } from '../../application/use-cases/get-resources.use-case.js';
import { GetResourcesQueryDto } from '../dtos/get-resources-query.dto.js';
import { Resource } from '../../domain/entities/resource.entity.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';

/**
 * Handles HTTP requests for resource management.
 * Error responses are handled by the global AllExceptionsFilter.
 */
@Controller('resources')
export class ResourceController {
  constructor(private readonly getResourcesUseCase: GetResourcesUseCase) {}

  @Get()
  async findAll(
    @Query() query: GetResourcesQueryDto,
  ): Promise<{ items: Resource[]; meta: ApiMeta }> {
    return this.getResourcesUseCase.execute(query);
  }
}
