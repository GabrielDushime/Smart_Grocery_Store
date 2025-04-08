// modules/checkout/dto/checkout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsObject, IsOptional } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'Payment method', enum: ['credit_card', 'paypal', 'cash'] })
  @IsNotEmpty()
  @IsEnum(['credit_card', 'paypal', 'cash'])
  paymentMethod: string;

  @ApiProperty({ description: 'Shipping address' })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;
  
  @ApiProperty({ description: 'Additional checkout metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}