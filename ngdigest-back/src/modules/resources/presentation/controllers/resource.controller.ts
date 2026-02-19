import { Controller, Get } from '@nestjs/common';
import { GetResourcesUseCase } from '../../application/use-cases/get-resources.use-case.js';
import { Resource } from '../../domain/entities/resource.entity.js';

@Controller('resources')
export class ResourceController {
  constructor(private readonly getResourcesUseCase: GetResourcesUseCase) {}

  @Get()
  async findAll(): Promise<Resource[]> {
    return this.getResourcesUseCase.execute();
  }
}
