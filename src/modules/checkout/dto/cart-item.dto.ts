// modules/checkout/dto/cart-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';

export class CartItemDto {
  @ApiProperty({ description: 'ID of the product to add to cart' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}