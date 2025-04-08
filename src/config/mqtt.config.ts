import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttConfig {
  constructor(private configService: ConfigService) {}

  getMqttOptions(): any {
    return {
      url: this.configService.get<string>('MQTT_BROKER_URL'),
      clientId: this.configService.get<string>('MQTT_CLIENT_ID'),
      username: this.configService.get<string>('MQTT_USERNAME'),
      password: this.configService.get<string>('MQTT_PASSWORD'),
    };
  }
}