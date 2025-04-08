import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttService } from './mqtt.service';
import { MqttConfig } from '../config/mqtt.config';

@Module({
  imports: [ConfigModule],
  providers: [MqttService, MqttConfig],
  exports: [MqttService],
})
export class MqttModule {}