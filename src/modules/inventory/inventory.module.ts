// modules/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../products/entities/product.entity';
import { MqttModule } from '../../services/mqtt.module';
import { ThingspeakModule } from '../../services/thingspeak.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, Product]),
    MqttModule,
    ThingspeakModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}