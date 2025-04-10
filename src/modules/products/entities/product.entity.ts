import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { CartItem } from '../../checkout/entities/cart.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the product' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The name of the product' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'The description of the product', required: false })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The price of the product' })
  price: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The image URL of the product', required: false })
  imageUrl?: string;

  @Column({ type: 'varchar', default: 'Unknown' })
  @ApiProperty({ description: 'The category of the product' })
  category: string;
  
  @Column({ nullable: true })
  @ApiProperty({ description: 'The barcode of the product', required: false })
  barcode?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The RFID tag of the product', required: false })
  rfidTag?: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the product is active' })
  isActive: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The location of the product in the store', required: false })
  location?: string;

  @OneToMany(() => Inventory, inventory => inventory.product, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  inventory: Inventory[];

  @OneToMany(() => CartItem, cartItem => cartItem.product, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  cartItems: CartItem[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the product was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the product was last updated' })
  updatedAt: Date;
}