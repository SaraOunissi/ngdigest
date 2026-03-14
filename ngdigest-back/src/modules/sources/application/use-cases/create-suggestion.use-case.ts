import { Injectable } from '@nestjs/common';
import { SuggestionRepository } from '../../infrastructure/repositories/suggestion.repository.js';
import { SuggestSourceDto } from '../../presentation/dtos/suggest-source.dto.js';

@Injectable()
export class CreateSuggestionUseCase {
  constructor(private readonly suggestionRepository: SuggestionRepository) {}

  async execute(dto: SuggestSourceDto): Promise<void> {
    await this.suggestionRepository.create(dto);
  }
}
