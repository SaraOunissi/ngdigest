import { Module } from '@nestjs/common';
import { ResourcesModule } from '../resources/resources.module.js';
import { DevtoFetcher } from './infrastructure/fetchers/devto.fetcher.js';
import { SerpapiNewsFetcher } from './infrastructure/fetchers/serpapi.fetcher.js';
import { AggregationService } from './application/services/aggregation.service.js';
import { RelevanceService } from './application/services/relevance.service.js';
import { RetentionService } from './application/services/retention.service.js';
import { AggregatorController } from './presentation/controllers/aggregator.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [AggregatorController],
  providers: [SerpapiNewsFetcher, DevtoFetcher, AggregationService, RelevanceService, RetentionService],
})
export class AggregatorModule {}
