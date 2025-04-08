import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../checkout/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @Column({ type: 'varchar', default: 'Unknown' })
  @ApiProperty({ description: 'The full name of the user' })
  fullName: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @ApiProperty({ description: 'The role of the user (customer, admin, store_manager)' })
  role: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The phone number of the user', required: false })
  phoneNumber?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The address of the user', required: false })
  address?: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether the user is an admin' })
  isAdmin: boolean;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the user was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the user was last updated' })
  updatedAt: Date;
}