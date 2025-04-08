// modules/inventory/dto/inventory-alert.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';

export class InventoryAlertDto {
  @ApiProperty({ description: 'ID of the product with low stock' })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Name of the product with low stock' })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Current quantity of the product' })
  @IsNotEmpty()
  @IsNumber()
  currentQuantity: number;

  @ApiProperty({ description: 'Low stock threshold' })
  @IsNotEmpty()
  @IsNumber()
  threshold: number;

  @ApiProperty({ description: 'Timestamp of when the alert was generated' })
  @IsNotEmpty()
  @IsDate()
  timestamp: Date;
}