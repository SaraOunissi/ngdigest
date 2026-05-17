import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateSuggestionUseCase } from '../../application/use-cases/create-suggestion.use-case.js';
import { SuggestSourceDto } from '../dtos/suggest-source.dto.js';
import { TRUSTED_DOMAINS } from '../../../aggregator/infrastructure/config/trusted-sources.js';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly createSuggestionUseCase: CreateSuggestionUseCase,
  ) {}

  @Get()
  getDomains(): string[] {
    return [...TRUSTED_DOMAINS];
  }

  @Post('suggest')
  @HttpCode(HttpStatus.CREATED)
  async suggest(@Body() dto: SuggestSourceDto): Promise<{ message: string }> {
    await this.createSuggestionUseCase.execute(dto);
    return { message: 'Suggestion enregistrée avec succès.' };
  }
}
