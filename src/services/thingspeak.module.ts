import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThingspeakService } from './thingspeak.service';
import { ThingspeakConfig } from '../config/thingspeak.config';

@Module({
  imports: [ConfigModule],
  providers: [ThingspeakService, ThingspeakConfig],
  exports: [ThingspeakService],
})
export class ThingspeakModule {}