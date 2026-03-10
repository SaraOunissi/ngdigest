import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetResourcesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sort?: string = '-publishedAt';

  @IsOptional()
  @IsIn(['fr', 'en', 'all'])
  lang?: 'fr' | 'en' | 'all' = 'all';
}
