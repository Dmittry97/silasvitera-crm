import { IsString } from 'class-validator';

export class ReserveProductDto {
  @IsString()
  userId!: string;
}
