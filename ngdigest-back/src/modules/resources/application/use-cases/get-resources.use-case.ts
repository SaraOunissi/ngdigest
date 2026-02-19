import { Injectable } from '@nestjs/common';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource } from '../../domain/entities/resource.entity.js';

@Injectable()
export class GetResourcesUseCase {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  async execute(): Promise<Resource[]> {
    return this.resourceRepository.findAll();
  }
}
