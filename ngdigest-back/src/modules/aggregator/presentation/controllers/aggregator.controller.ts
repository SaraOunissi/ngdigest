import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AggregationService } from '../../application/services/aggregation.service.js';

@Controller('aggregator')
export class AggregatorController {
  constructor(private readonly aggregationService: AggregationService) {}

  /**
   * Manually triggers a full aggregation run.
   * Intended for development and testing purposes.
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async trigger(): Promise<{ message: string }> {
    await this.aggregationService.runAggregation();
    return { message: 'Aggregation triggered successfully' };
  }
}
