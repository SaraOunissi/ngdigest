import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suggestion, SuggestionDocument } from '../../domain/entities/suggestion.entity.js';
import { SuggestSourceDto } from '../../presentation/dtos/suggest-source.dto.js';

@Injectable()
export class SuggestionRepository {
  constructor(
    @InjectModel(Suggestion.name)
    private readonly suggestionModel: Model<SuggestionDocument>,
  ) {}

  async create(dto: SuggestSourceDto): Promise<Suggestion> {
    const suggestion = new this.suggestionModel(dto);
    return suggestion.save();
  }
}
