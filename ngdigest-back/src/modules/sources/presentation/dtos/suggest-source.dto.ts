import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SuggestSourceDto {
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: "URL invalide. Seuls les protocoles http et https sont acceptés." },
  )
  @MaxLength(500, { message: 'URL trop longue (max 500 caractères).' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Raison trop longue (max 1000 caractères).' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  reason?: string;
}
