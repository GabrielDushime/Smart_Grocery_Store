import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the cart item' })
  id: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The order ID', required: false })
  orderId?: string;

  @ManyToOne(() => Order, order => order.items, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column()
  @ApiProperty({ description: 'The product ID' })
  productId: string;

  @ManyToOne(() => Product, product => product.cartItems, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'The quantity of the product' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The unit price of the product' })
  unitPrice: number;

  @Column({ nullable: true, type: 'uuid' })
  @ApiProperty({ description: 'The user ID who added this item to cart', required: false })
  userId?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The session ID for guest users', required: false })
  sessionId?: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the cart item was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the cart item was last updated' })
  updatedAt: Date;
}