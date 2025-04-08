// modules/checkout/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsObject, 
  IsOptional, 
  IsUUID, 
  IsNumber, 
  ValidateNested, 
  IsArray, 
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: 'ID of the product' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price of the product (optional, uses product price if not provided)', required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID for the order' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Order status', enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ description: 'Payment method', enum: ['credit_card', 'paypal', 'cash', 'bank_transfer'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Payment transaction ID', required: false })
  @IsOptional()
  @IsString()
  paymentTransactionId?: string;

  @ApiProperty({ description: 'Additional order metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}