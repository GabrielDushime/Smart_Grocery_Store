// modules/checkout/checkout.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,IsNull } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { CartItemDto } from './dto/cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import {CreateOrderDto} from './dto/create-order.dto'
import { InventoryService } from '../inventory/inventory.service';
import { MqttService } from '../../services/mqtt.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private inventoryService: InventoryService,
    private mqttService: MqttService,
  ) {}

  async addToCart(userId: string, cartItemDto: CartItemDto): Promise<CartItem> {
    const product = await this.productRepository.findOne({ where: { id: cartItemDto.productId } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${cartItemDto.productId} not found`);
    }
    
  
    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId: cartItemDto.productId },
      relations: ['product'],
    });
    
    if (cartItem) {
     
      cartItem.quantity += cartItemDto.quantity;
    } else {
     
      cartItem = this.cartRepository.create({
        userId,
        productId: product.id,
        product,
        quantity: cartItemDto.quantity,
        unitPrice: product.price,
      });
    }
    
    return this.cartRepository.save(cartItem);
  }

  async getUserCart(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });
  }

  async removeFromCart(userId: string, cartId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });
    
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartId} not found`);
    }
    
    await this.cartRepository.remove(cartItem);
  }

  async checkout(userId: string, checkoutDto: CheckoutDto): Promise<Order> {
  
    const cartItems = await this.getUserCart(userId);
    
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    
    
    let totalAmount = 0;
    
    for (const item of cartItems) {
      totalAmount += Number(item.unitPrice) * item.quantity;
    }
    
    
    const order = this.orderRepository.create({
      userId,
      totalAmount,
      status: 'pending',
      paymentMethod: checkoutDto.paymentMethod,
      metadata: {
        shippingAddress: checkoutDto.shippingAddress
      }
    });
    
    const savedOrder = await this.orderRepository.save(order);
    
    
    for (const item of cartItems) {
      item.orderId = savedOrder.id;
      item.order = savedOrder;
      await this.cartRepository.save(item);
      
     
      await this.inventoryService.updateStock(item.productId, -item.quantity);
    }
    
 
    savedOrder.status = 'completed';
    await this.orderRepository.save(savedOrder);
    
   
    this.mqttService.publish('checkout/order-completed', JSON.stringify({
      orderId: savedOrder.id,
      userId,
      totalAmount,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      timestamp: new Date().toISOString(),
    }));
    
    return savedOrder;
  }

  async clearCart(userId: string): Promise<void> {
    const cartItems = await this.cartRepository.find({ 
      where: { 
        userId,
        orderId: IsNull() 
      } 
    });
    await this.cartRepository.remove(cartItems);
  }

  async getOrderHistory(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product']
    });
  }

  async getOrderDetails(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    
    return order;
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
   
    for (const item of orderData.items) {
      const product = await this.productRepository.findOne({ 
        where: { id: item.productId } 
      });
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    }
    
  
    let totalAmount = 0;
    const orderItems: CartItem[] = [];
    
    for (const item of orderData.items) {
      const product = await this.productRepository.findOne({ 
        where: { id: item.productId } 
      });
      
   
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      
      const cartItem = this.cartRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.price,
        userId: orderData.userId,
      });
      
      totalAmount += Number(cartItem.unitPrice) * cartItem.quantity;
      orderItems.push(cartItem);
    }
    
    
    const order = this.orderRepository.create({
      userId: orderData.userId,
      totalAmount,
      status: orderData.status || 'pending',
      paymentMethod: orderData.paymentMethod,
      paymentTransactionId: orderData.paymentTransactionId,
      metadata: orderData.metadata || {},
    });
    
    const savedOrder = await this.orderRepository.save(order);
    
    
    for (const item of orderItems) {
      item.orderId = savedOrder.id;
      item.order = savedOrder;
      await this.cartRepository.save(item);
      
      
      if (savedOrder.status === 'completed') {
        await this.inventoryService.updateStock(item.productId, -item.quantity);
      }
    }
    
   
    if (savedOrder.status === 'completed') {
      this.mqttService.publish('checkout/order-created', JSON.stringify({
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        totalAmount,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        timestamp: new Date().toISOString(),
      }));
    }
    
   
    const completedOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items', 'items.product']
    });
    
    if (!completedOrder) {
      throw new NotFoundException(`Order with ID ${savedOrder.id} not found after creation`);
    }
    
    return completedOrder;
  }
  async deleteOrder(userId: string, orderId: string): Promise<void> {
   
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found or doesn't belong to this user`);
    }
    
    
    if (order.status === 'completed') {
    
      for (const item of order.items) {
        await this.inventoryService.updateStock(item.productId, item.quantity);
      }
      
      
      this.mqttService.publish('checkout/order-deleted', JSON.stringify({
        orderId: order.id,
        userId,
        timestamp: new Date().toISOString(),
      }));
    }
    
   
    if (order.items && order.items.length > 0) {
      await this.cartRepository.remove(order.items);
    }
    
  
    await this.orderRepository.remove(order);
  }
}