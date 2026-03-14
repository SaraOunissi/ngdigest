import { Injectable } from '@nestjs/common';
import { TRUSTED_DOMAINS } from '../../../aggregator/infrastructure/config/trusted-sources.js';

@Injectable()
export class GetSourcesUseCase {
  execute(): string[] {
    return [...TRUSTED_DOMAINS];
  }
}
