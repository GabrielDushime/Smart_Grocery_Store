import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fresh Apples', description: 'The name of the product' })
  name: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Organic fresh red apples', description: 'The description of the product', required: false })
  description?: string;
  
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  @ApiProperty({ example: 2.99, description: 'The price of the product' })
  price: number;
  
  // This field will be populated by the controller after file upload
  @IsString()
  @IsOptional()
  imageUrl?: string;
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fruits', description: 'The category of the product' })
  category: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123456789', description: 'The barcode of the product', required: false })
  barcode?: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'rfid-12345', description: 'The RFID tag of the product', required: false })
  rfidTag?: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Aisle 5, Shelf 3', description: 'The location of the product in the store', required: false })
  location?: string;
}