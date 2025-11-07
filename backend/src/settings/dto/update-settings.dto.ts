import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];
}
