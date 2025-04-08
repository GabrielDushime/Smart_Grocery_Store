import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { Order } from './modules/checkout/entities/order.entity';
import { User } from './modules/users/entities/user.entity';
import { CartItem } from './modules/checkout/entities/cart.entity';
import { Product } from './modules/products/entities/product.entity';
import { Inventory } from './modules/inventory/entities/inventory.entity';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MqttModule } from './services/mqtt.module';
import { ThingspeakModule } from './services/thingspeak.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SimulationModule } from './modules/simulation/simulation.module';


@Module({
  imports: [
   
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
  
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isDev = configService.get<string>('NODE_ENV') === 'development';

        return {
          type: 'postgres',
          url: databaseUrl,
          synchronize: isDev,
          logging: ['error'],
          ssl: databaseUrl?.includes('localhost') ? false : { rejectUnauthorized: false },
          migrations: ['dist/database/migrations/**/*{.ts,.js}'],
          migrationsRun: true,
          entities: [User, Order, CartItem,Product,Inventory],

        };
      },
    }),
    UsersModule,
    AuthModule,
    CheckoutModule,
    ProductsModule,
    InventoryModule,
    MqttModule,
    ThingspeakModule,
    AnalyticsModule,
    SimulationModule,
  

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}