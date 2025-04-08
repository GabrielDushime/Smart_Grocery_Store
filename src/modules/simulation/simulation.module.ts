// src/modules/simulation/simulation.module.ts
import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { MqttModule } from '../../services/mqtt.module';
import { ThingspeakModule } from '../../services/thingspeak.module';

@Module({
  imports: [MqttModule, ThingspeakModule],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}