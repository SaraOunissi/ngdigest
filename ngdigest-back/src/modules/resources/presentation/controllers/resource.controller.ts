import { Controller, Get, Query } from '@nestjs/common';
import {
  GetResourcesUseCase,
  ResourceItem,
} from '../../application/use-cases/get-resources.use-case.js';
import { GetResourcesQueryDto } from '../dtos/get-resources-query.dto.js';
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
  ): Promise<{ items: ResourceItem[]; meta: ApiMeta }> {
    return this.getResourcesUseCase.execute(query);
  }
}
