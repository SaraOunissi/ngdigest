import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { GetSourcesUseCase } from '../../application/use-cases/get-sources.use-case.js';
import { CreateSuggestionUseCase } from '../../application/use-cases/create-suggestion.use-case.js';
import { SuggestSourceDto } from '../dtos/suggest-source.dto.js';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly getSourcesUseCase: GetSourcesUseCase,
    private readonly createSuggestionUseCase: CreateSuggestionUseCase,
  ) {}

  @Get()
  getDomains(): string[] {
    return this.getSourcesUseCase.execute();
  }

  @Post('suggest')
  @HttpCode(HttpStatus.CREATED)
  async suggest(@Body() dto: SuggestSourceDto): Promise<{ message: string }> {
    await this.createSuggestionUseCase.execute(dto);
    return { message: 'Suggestion enregistrée avec succès.' };
  }
}
