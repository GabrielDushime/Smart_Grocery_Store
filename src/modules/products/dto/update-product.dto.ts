import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Fresh Organic Apples', description: 'The name of the product', required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Organic fresh red apples', description: 'The description of the product', required: false })
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ example: 3.49, description: 'The price of the product', required: false })
  price?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'https://example.com/apple.jpg', description: 'The image URL of the product', required: false })
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Organic Fruits', description: 'The category of the product', required: false })
  category?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123456789', description: 'The barcode of the product', required: false })
  barcode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'rfid-12345', description: 'The RFID tag of the product', required: false })
  rfidTag?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true, description: 'Whether the product is active', required: false })
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Aisle 5, Shelf 3', description: 'The location of the product in the store', required: false })
  location?: string;
}