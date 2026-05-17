import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Suggestion, SuggestionSchema } from './domain/entities/suggestion.entity.js';
import { SuggestionRepository } from './infrastructure/repositories/suggestion.repository.js';
import { CreateSuggestionUseCase } from './application/use-cases/create-suggestion.use-case.js';
import { SourcesController } from './presentation/controllers/sources.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Suggestion.name, schema: SuggestionSchema }]),
  ],
  controllers: [SourcesController],
  providers: [SuggestionRepository, CreateSuggestionUseCase],
})
export class SourcesModule {}
