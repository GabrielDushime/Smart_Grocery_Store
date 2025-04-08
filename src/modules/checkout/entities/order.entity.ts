import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the order' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The user ID' })
  userId: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CartItem, cartItem => cartItem.order)
  items: CartItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The total amount of the order' })
  totalAmount: number;

  @Column({ default: 'pending' })
  @ApiProperty({ description: 'The status of the order (pending, completed, cancelled)' })
  status: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The payment method used', required: false })
  paymentMethod?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The payment transaction ID', required: false })
  paymentTransactionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Additional order metadata', required: false })
  metadata?: any;

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the order was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the order was last updated' })
  updatedAt: Date;
}