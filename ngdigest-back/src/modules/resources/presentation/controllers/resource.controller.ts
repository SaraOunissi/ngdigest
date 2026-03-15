import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  GetResourcesUseCase,
  ResourceItem,
} from '../../application/use-cases/get-resources.use-case.js';
import { RedetectLanguagesUseCase } from '../../application/use-cases/redetect-languages.use-case.js';
import { GetResourcesQueryDto } from '../dtos/get-resources-query.dto.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';

/**
 * Handles HTTP requests for resource management.
 * Error responses are handled by the global AllExceptionsFilter.
 */
@Controller('resources')
export class ResourceController {
  constructor(
    private readonly getResourcesUseCase: GetResourcesUseCase,
    private readonly redetectLanguagesUseCase: RedetectLanguagesUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() query: GetResourcesQueryDto,
  ): Promise<{ items: ResourceItem[]; meta: ApiMeta }> {
    return this.getResourcesUseCase.execute(query);
  }

  /**
   * Admin endpoint: re-runs language detection on all existing resources.
   * Use after updating the detection logic to backfill previously mis-tagged articles.
   */
  @Post('redetect-languages')
  @HttpCode(HttpStatus.OK)
  async redetectLanguages(): Promise<{ updated: number; total: number }> {
    return this.redetectLanguagesUseCase.execute();
  }
}
