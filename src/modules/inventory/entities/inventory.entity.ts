import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the inventory record' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The product ID' })
  productId: string;

  @ManyToOne(() => Product, product => product.inventory)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'The current stock quantity' })
  currentStock: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'The minimum stock level before alert' })
  minStockLevel: number;

  @Column({ nullable: true, type: 'int' })
  @ApiProperty({ description: 'The maximum stock capacity', required: false })
  maxStockCapacity?: number;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether a low stock alert has been triggered' })
  lowStockAlert: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  @ApiProperty({ description: 'The timestamp when the stock was last replenished', required: false })
  lastReplenishedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'The sensor data from shelf weight sensors', required: false })
  sensorData?: any;

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the inventory record was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the inventory record was last updated' })
  updatedAt: Date;
}