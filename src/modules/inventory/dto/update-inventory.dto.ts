// modules/inventory/dto/update-inventory.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Current quantity of the product', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @ApiProperty({ description: 'Low stock threshold to trigger alerts', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  minStockLevel?: number;
}