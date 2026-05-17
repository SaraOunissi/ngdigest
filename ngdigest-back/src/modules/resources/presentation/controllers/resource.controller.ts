import { Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  GetResourcesUseCase,
  ResourceItem,
} from '../../application/use-cases/get-resources.use-case.js';
import { RedetectLanguagesUseCase } from '../../application/use-cases/redetect-languages.use-case.js';
import { GetResourcesQueryDto } from '../dtos/get-resources-query.dto.js';
import { ApiMeta } from '../../../../common/interfaces/api-response.interface.js';
import { AdminGuard } from '../../../../common/guards/admin.guard.js';

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
   * Requires X-Admin-Key header matching ADMIN_SECRET env var.
   */
  @Post('redetect-languages')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @SkipThrottle()
  async redetectLanguages(): Promise<{ updated: number; total: number }> {
    return this.redetectLanguagesUseCase.execute();
  }
}
