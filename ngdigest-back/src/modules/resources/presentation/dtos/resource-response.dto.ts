import { Expose, Type } from 'class-transformer';

export class ResourceResponseDto {
  @Expose()
  title!: string;

  @Expose()
  url!: string;

  @Expose()
  source!: string;

  @Expose()
  @Type(() => Date)
  publishedAt!: Date;

  @Expose()
  score!: number;

  @Expose()
  tags!: string[];

  @Expose()
  isRead!: boolean;

  @Expose()
  isFavorite!: boolean;
}
