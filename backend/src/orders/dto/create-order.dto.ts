import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customerContact!: string;

  @IsString()
  contactMethod!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsString()
  @IsOptional()
  pickupPoint?: string;

  @IsArray()
  items!: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    size?: string;
  }>;

  @IsNumber()
  total!: number;

  @IsString()
  @IsOptional()
  status?: string;
}
