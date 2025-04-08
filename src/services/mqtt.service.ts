import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { MqttConfig } from '../config/mqtt.config';
import { MqttClient } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private topicSubscriptions: Map<string, ((message: string) => void)[]> = new Map();

  constructor(private mqttConfig: MqttConfig) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    const options = this.mqttConfig.getMqttOptions();
    this.client = mqtt.connect(options.url, {
      clientId: options.clientId,
      username: options.username,
      password: options.password,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      
    
      for (const topic of this.topicSubscriptions.keys()) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            this.logger.error(`Error subscribing to ${topic}:`, err);
          } else {
            this.logger.log(`Re-subscribed to topic: ${topic}`);
          }
        });
      }
    });

    this.client.on('message', (topic, message) => {
      const callbacks = this.topicSubscriptions.get(topic);
      if (callbacks) {
        const messageStr = message.toString();
        callbacks.forEach(callback => callback(messageStr));
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT client error:', err);
    });

    this.client.on('disconnect', () => {
      this.logger.log('Disconnected from MQTT broker');
    });
  }

  private disconnect() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  publish(topic: string, message: string | object): void {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT client not connected. Attempting to reconnect...');
      this.connect();
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    this.client.publish(topic, payload);
    this.logger.debug(`Published to ${topic}: ${payload}`);
  }

  subscribe(topic: string, callback: (message: string) => void): void {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT client not connected. Attempting to reconnect...');
      this.connect();
      return;
    }

    let callbacks = this.topicSubscriptions.get(topic);
    if (!callbacks) {
      callbacks = [];
      this.topicSubscriptions.set(topic, callbacks);
      
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Error subscribing to ${topic}:`, err);
        } else {
          this.logger.log(`Subscribed to topic: ${topic}`);
        }
      });
    }
    
    callbacks.push(callback);
  }

  unsubscribe(topic: string, callback?: (message: string) => void): void {
    const callbacks = this.topicSubscriptions.get(topic);
    if (!callbacks) {
      return;
    }

    if (callback) {
   
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }

      // If no more callbacks, unsubscribe from topic
      if (callbacks.length === 0) {
        this.topicSubscriptions.delete(topic);
        this.client.unsubscribe(topic);
        this.logger.log(`Unsubscribed from topic: ${topic}`);
      }
    } else {
     
      this.topicSubscriptions.delete(topic);
      this.client.unsubscribe(topic);
      this.logger.log(`Unsubscribed from topic: ${topic}`);
    }
  }
}