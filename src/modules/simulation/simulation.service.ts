// src/modules/simulation/simulation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MqttService } from '../../services/mqtt.service';
import { ThingspeakService } from '../../services/thingspeak.service';

// Export the interface so it can be used in return types
export interface CheckoutItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface CheckoutSimulationResult {
  userId: string;
  items: CheckoutItem[];
  totalAmount: number;
  timestamp: string;
}

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  private simulating = false;
  private simulationIntervals: NodeJS.Timeout[] = [];

  constructor(
    private mqttService: MqttService,
    private thingspeakService: ThingspeakService,
  ) {}

  startSimulation() {
    if (this.simulating) {
      return { message: 'Simulation already running' };
    }

    this.simulating = true;
    this.logger.log('Starting IoT device simulation');

    this.simulateRFIDSensors();
    this.simulateWeightSensors();
    this.simulateEnvironmentalSensors();
    this.simulateMotionSensors();

    return { message: 'Simulation started successfully' };
  }

  stopSimulation() {
    if (!this.simulating) {
      return { message: 'No simulation is running' };
    }

    this.simulating = false;
    this.simulationIntervals.forEach(clearInterval);
    this.simulationIntervals = [];
    this.logger.log('Stopped IoT device simulation');

    return { message: 'Simulation stopped successfully' };
  }

  private simulateRFIDSensors() {
    const interval = setInterval(() => {
      if (!this.simulating) return;

      const productId = Math.floor(Math.random() * 20) + 1;
      const timestamp = new Date().toISOString();

      this.mqttService.publish('sensors/rfid', JSON.stringify({
        type: 'rfid_read',
        productId,
        location: 'checkout_zone',
        timestamp,
      }));

      this.logger.debug(`RFID sensor detected product ${productId} at checkout`);
    }, 5000);

    this.simulationIntervals.push(interval);
  }

  private simulateWeightSensors() {
    const interval = setInterval(() => {
      if (!this.simulating) return;

      const shelfId = Math.floor(Math.random() * 10) + 1;
      const weight = Math.random() * 5;
      const timestamp = new Date().toISOString();

      this.mqttService.publish('sensors/weight', JSON.stringify({
        type: 'weight_changed',
        shelfId,
        weight,
        timestamp,
      }));

      this.thingspeakService.updateChannel({
        field5: shelfId,
        field6: weight.toFixed(2),
      });

      this.logger.debug(`Weight sensor on shelf ${shelfId} measured ${weight.toFixed(2)}kg`);
    }, 8000);

    this.simulationIntervals.push(interval);
  }

  private simulateEnvironmentalSensors() {
    const interval = setInterval(() => {
      if (!this.simulating) return;
  
      const temperature = 18 + Math.random() * 6;
      const humidity = 40 + Math.random() * 20;
      const timestamp = new Date().toISOString();
  
      this.mqttService.publish('sensors/environmental', JSON.stringify({
        type: 'environmental_reading',
        temperature,
        humidity,
        timestamp,
      }));
  
      
      this.thingspeakService.updateTemperatureData(
        temperature.toFixed(1),
        humidity.toFixed(1)
      );
  
      this.logger.debug(`Environmental sensors: ${temperature.toFixed(1)}°C, ${humidity.toFixed(1)}% humidity`);
    }, 60000);
  
    this.simulationIntervals.push(interval);
  }

  private simulateMotionSensors() {
    const interval = setInterval(() => {
      if (!this.simulating) return;

      const zoneId = Math.floor(Math.random() * 8) + 1;
      const customerCount = Math.floor(Math.random() * 5);
      const timestamp = new Date().toISOString();

      this.mqttService.publish('sensors/motion', JSON.stringify({
        type: 'motion_detected',
        zoneId,
        customerCount,
        timestamp,
      }));

      this.thingspeakService.updateChannel({
        field7: zoneId,
        field8: customerCount,
      });

      this.logger.debug(`Motion sensors: ${customerCount} customers in zone ${zoneId}`);
    }, 10000);

    this.simulationIntervals.push(interval);
  }

  simulateCheckout(userId: string, numberOfItems: number = 3): { 
    message: string; 
    data: CheckoutSimulationResult; 
  } {
    const items: CheckoutItem[] = [];
    let totalAmount = 0;
  
    for (let i = 0; i < numberOfItems; i++) {
      const productId = Math.floor(Math.random() * 20) + 1;
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = Math.floor(Math.random() * 10) + 1;
      const amount = price * quantity;
  
      items.push({
        productId,
        productName: `Product ${productId}`,
        quantity,
        price,
      });
  
      totalAmount += amount;
    }
  
    const checkoutData: CheckoutSimulationResult = {
      userId, // Now accepts string
      items,
      totalAmount,
      timestamp: new Date().toISOString(),
    };
  
    this.mqttService.publish('checkout/simulation', JSON.stringify(checkoutData));
  
    return {
      message: 'Checkout simulation sent',
      data: checkoutData,
    };
  }
}