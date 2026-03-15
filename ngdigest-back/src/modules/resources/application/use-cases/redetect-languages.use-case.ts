import { Injectable, Logger } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { detectLanguage } from '../../../aggregator/infrastructure/config/language-detector.js';
import { ResourceLanguage } from '../../domain/entities/resource.entity.js';

@Injectable()
export class RedetectLanguagesUseCase {
  private readonly logger = new Logger(RedetectLanguagesUseCase.name);

  constructor(private readonly resourceRepository: ResourceRepository) {}

  /**
   * Re-runs language detection on every resource in the database and persists
   * the updated language field for entries where detection changed.
   */
  async execute(): Promise<{ updated: number; total: number }> {
    const resources = await this.resourceRepository.findAll();

    const updates: { id: string; language: ResourceLanguage }[] = [];

    for (const resource of resources) {
      const newLang = detectLanguage(resource.url, resource.title);
      if (newLang !== resource.language) {
        updates.push({ id: resource._id.toString(), language: newLang });
      }
    }

    await this.resourceRepository.bulkUpdateLanguages(updates);
    this.logger.log(
      `Re-detect languages: ${updates.length}/${resources.length} updated`,
    );

    return { updated: updates.length, total: resources.length };
  }
}
