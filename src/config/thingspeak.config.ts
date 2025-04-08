import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThingspeakConfig {
  constructor(private configService: ConfigService) {}

  getThingspeakOptions(): any {
    return {
      apiKey: this.configService.get<string>('THINGSPEAK_API_KEY'),
      channelId: this.configService.get<string>('THINGSPEAK_CHANNEL_ID'),
      apiUrl: 'https://api.thingspeak.com',
    };
  }
}