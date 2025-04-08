// modules/checkout/checkout.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { CartItem } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { MqttModule } from '../../services/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Order, Product]),
    InventoryModule,
    MqttModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}