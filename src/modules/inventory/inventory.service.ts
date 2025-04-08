// modules/inventory/inventory.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../products/entities/product.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { MqttService } from '../../services/mqtt.service';
import { ThingspeakService } from '../../services/thingspeak.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private mqttService: MqttService,
    private thingspeakService: ThingspeakService,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ 
      where: { id },
      relations: ['product']
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProduct(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for product with ID ${productId} not found`);
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    
    const updatedInventory = Object.assign(inventory, updateInventoryDto);
    await this.inventoryRepository.save(updatedInventory);
    
  
    this.mqttService.publish('inventory/update', JSON.stringify({
      productId: inventory.productId,
      quantity: updatedInventory.currentStock,
      timestamp: new Date().toISOString(),
    }));
    
    try {
      
      const productIdForThingspeak = this.generateNumericIdFromUuid(inventory.productId);
      
      
      await this.thingspeakService.updateInventoryData(
        productIdForThingspeak,
        updatedInventory.currentStock
      );
    } catch (error) {
      this.logger.error(`Failed to update ThingSpeak: ${error.message}`);
     
    }
    
   
    if (updatedInventory.currentStock !== undefined && 
        updatedInventory.minStockLevel !== undefined && 
        updatedInventory.currentStock <= updatedInventory.minStockLevel) {
      this.sendLowStockAlert(updatedInventory);
    }
    
    return updatedInventory;
  }

  async updateStock(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProduct(productId);
    const newQuantity = inventory.currentStock + quantity;
    
    return this.update(inventory.id, { currentStock: newQuantity });
  }

  private async sendLowStockAlert(inventory: Inventory): Promise<void> {
    const alertData = {
      productId: inventory.productId,
      productName: inventory.product.name,
      currentQuantity: inventory.currentStock,
      threshold: inventory.minStockLevel,
      timestamp: new Date().toISOString(),
    };
    
    this.logger.warn(`Low stock alert: ${JSON.stringify(alertData)}`);
    
  
    this.mqttService.publish('inventory/alerts/low-stock', JSON.stringify(alertData));
  }

  private generateNumericIdFromUuid(uuid: string): number {
    if (!uuid) return 0;
    
    
    const cleanUuid = uuid.replace(/-/g, '');
    const lastPart = cleanUuid.slice(-8);
    
   
    const numericId = parseInt(lastPart, 16) % 1000000;
    
    return numericId;
  }

  async initializeInventory(): Promise<void> {
    const products = await this.productRepository.find();
    
    for (const product of products) {
      const existingInventory = await this.inventoryRepository.findOne({
        where: { productId: product.id }
      });
      
      if (!existingInventory) {
       
        const newInventory = this.inventoryRepository.create();
        newInventory.productId = product.id;
        newInventory.product = product;
        newInventory.currentStock = 50;
        newInventory.minStockLevel = 10;
        newInventory.lowStockAlert = false;
        newInventory.lastReplenishedAt = new Date();
        
        await this.inventoryRepository.save(newInventory);
      }
    }
    
    this.logger.log('Inventory initialized successfully');
  }
  async initializeProductInventory(productId: string): Promise<Inventory> {
   
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    
    const existingInventory = await this.inventoryRepository.findOne({
      where: { productId }
    });
    
    if (existingInventory) {
      
      return existingInventory;
    }
    
   
    const newInventory = this.inventoryRepository.create();
    newInventory.productId = product.id;
    newInventory.product = product;
    newInventory.currentStock = 50; 
    newInventory.minStockLevel = 10; 
    newInventory.lowStockAlert = false;
    newInventory.lastReplenishedAt = new Date();
    
    
    const savedInventory = await this.inventoryRepository.save(newInventory);
    
    this.logger.log(`Inventory initialized for product ${product.id}`);
    
    return savedInventory;
  }

}