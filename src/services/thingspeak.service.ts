// services/thingspeak/thingspeak.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ThingspeakConfig } from '../config/thingspeak.config';

@Injectable()
export class ThingspeakService {
  private readonly logger = new Logger(ThingspeakService.name);
  private options: any;

  constructor(private thingspeakConfig: ThingspeakConfig) {
    this.options = this.thingspeakConfig.getThingspeakOptions();
  }

  async updateChannel(data: Record<string, number | string>): Promise<any> {
    try {
      const params = {
        api_key: this.options.apiKey,
        ...data,
      };
      const url = `${this.options.apiUrl}/update`;
      const response = await axios.post(url, null, { params });
      
      this.logger.debug('ThingSpeak channel updated successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Error updating ThingSpeak channel:', error);
      throw error;
    }
  }

  async getChannelData(numResults: number = 100): Promise<any> {
    try {
      const url = `${this.options.apiUrl}/channels/${this.options.channelId}/feeds.json`;
      const params = {
        api_key: this.options.apiKey,
        results: numResults,
      };
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting ThingSpeak channel data:', error);
      throw error;
    }
  }

  async createField(fieldName: string, fieldData: number | string): Promise<any> {
    try {
      const field = {
        field1: fieldName,
        field2: fieldData,
      };
      return await this.updateChannel(field);
    } catch (error) {
      this.logger.error(`Error creating field ${fieldName}:`, error);
      throw error;
    }
  }
  
  async updateInventoryData(productId: number, quantity: number): Promise<any> {
    return this.updateChannel({
      field1: productId,
      field2: quantity,
    });
  }
  

  async updateTemperatureData(temperature: number | string, humidity: number | string): Promise<any> {
    return this.updateChannel({
      field3: temperature,
      field4: humidity,
    });
  }
}