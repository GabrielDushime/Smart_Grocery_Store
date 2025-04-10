// modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../checkout/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ThingspeakService } from '../../services/thingspeak.service';
import { subDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private thingspeakService: ThingspeakService,
  ) {}

  async getSalesOverview(days: number = 7): Promise<any> {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());
    
    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });
    
    // Group orders by day
    const salesByDay = {};
    let totalSales = 0;
    
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = 0;
      }
      salesByDay[day] += order.totalAmount;
      totalSales += order.totalAmount;
    });
    
    // Calculate average order value
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
    
    return {
      totalSales,
      totalOrders: orders.length,
      averageOrderValue,
      salesByDay,
    };
  }

  async getTopSellingProducts(limit: number = 5): Promise<any> {
    // This is a simplified implementation
    // In a real-world scenario, this would involve more complex queries
    const products = await this.productRepository.find();
    const orders = await this.orderRepository.find({
      relations: ['items', 'items.product']
    });
    
    const productSales = {};
    
    // Calculate sales for each product
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            name: item.product.name, // Getting name from the related product
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.unitPrice * item.quantity; // Using unitPrice from CartItem
      });
    });
    
  
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, limit);
    
    return topProducts;
  }

  async getInventoryStatus(): Promise<any> {
    const inventory = await this.inventoryRepository.find({
      relations: ['product'],
    });
    
  
    const lowStockItems = inventory.filter(item => item.currentStock <= item.minStockLevel);
    const outOfStockItems = inventory.filter(item => item.currentStock === 0);
    
    return {
      totalItems: inventory.length,
      lowStockItems: lowStockItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.currentStock,
        threshold: item.minStockLevel,
      })),
      outOfStockItems: outOfStockItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
      })),
    };
  }

  async getThingspeakData(): Promise<any> {
    try {
      const channelData = await this.thingspeakService.getChannelData(50);
      return {
        feeds: channelData.feeds,
        channelInfo: channelData.channel,
      };
    } catch (error) {
      return {
        error: 'Failed to fetch ThingSpeak data',
        message: error.message,
      };
    }
  }
}