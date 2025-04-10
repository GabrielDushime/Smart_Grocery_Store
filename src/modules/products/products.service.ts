import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(category?: string): Promise<Product[]> {
    if (category) {
      return this.productsRepository.find({ where: { category, isActive: true } });
    }
    return this.productsRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { barcode } });
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }

  async findByRfidTag(rfidTag: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { rfidTag } });
    if (!product) {
      throw new NotFoundException(`Product with RFID tag ${rfidTag} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    

    if (updateProductDto.imageUrl && product.imageUrl && product.imageUrl !== updateProductDto.imageUrl) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async setInactive(id: string): Promise<Product> {
    const product = await this.findOne(id);
    

    product.isActive = false;
    return this.productsRepository.save(product);
  }
  
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    
   
    if (product.imageUrl) {
      try {
        const imagePath = path.join(process.cwd(), 'public', product.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        
      
        const frontendPath = path.join(process.cwd(), '..', 'smart-grocery-store-frontend', 'public', product.imageUrl);
        if (fs.existsSync(frontendPath)) {
          fs.unlinkSync(frontendPath);
        }
      } catch (error) {
        console.error('Error deleting product image files:', error);
      }
    }
    
  
    await this.productsRepository.remove(product);
  }

  async getCategories(): Promise<string[]> {
    const products = await this.productsRepository.find({ select: ['category'] });
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
  }

  async findAllIncludingInactive(): Promise<Product[]> {
    return this.productsRepository.find();
  }
}