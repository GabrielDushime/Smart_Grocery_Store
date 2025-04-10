import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  private ensureDirectoryExists(directory: string) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

 
  private copyToFrontend(filename: string) {
    try {
     
      const backendPath = path.join(process.cwd(), 'public', 'images', filename);
      

      const frontendPath = path.join(process.cwd(), '..', 'smart-grocery-store-frontend', 'public', 'images', filename);
      
   
      this.ensureDirectoryExists(path.dirname(frontendPath));
      
    
      fs.copyFileSync(backendPath, frontendPath);
      console.log(`Successfully copied image to frontend: ${frontendPath}`);
    } catch (error) {
      console.error('Error copying file to frontend:', error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Product image file'
        },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        barcode: { type: 'string' },
        rfidTag: { type: 'string' },
        location: { type: 'string' }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
      
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `product-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
    
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, 
      },
    }),
  )
  async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    
  
    const imageUrl = `/images/${file.filename}`;
    createProductDto.imageUrl = imageUrl;
    

    this.copyToFrontend(file.filename);
    
    return this.productsService.create(createProductDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all products including inactive ones (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all products' })
  findAll() {
    return this.productsService.findAllIncludingInactive();
  }

  @Get()
  @ApiOperation({ summary: 'Get all active products, optionally filtered by category' })
  @ApiResponse({ status: 200, description: 'Returns active products' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter products by category' })
  findAllActive(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Returns all product categories' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get product by barcode' })
  @ApiResponse({ status: 200, description: 'Returns the product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'barcode', description: 'Product barcode' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('rfid/:rfidTag')
  @ApiOperation({ summary: 'Get product by RFID tag' })
  @ApiResponse({ status: 200, description: 'Returns the product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'rfidTag', description: 'Product RFID tag' })
  findByRfidTag(@Param('rfidTag') rfidTag: string) {
    return this.productsService.findByRfidTag(rfidTag);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product information (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Update product image (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product image successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Product image file'
        }
      }
    }
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `product-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async updateImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    
   
    const product = await this.productsService.findOne(id);
    
    
    const imageUrl = `/images/${file.filename}`;
    
  
    if (product.imageUrl) {
      try {
        const oldFilename = product.imageUrl.split('/').pop();
        if (oldFilename) {
          const backendPath = path.join(process.cwd(), 'public', 'images', oldFilename);
          if (fs.existsSync(backendPath)) {
            fs.unlinkSync(backendPath);
          }
          
          
          const frontendPath = path.join(process.cwd(), '..', 'frontend', 'public', 'images', oldFilename);
          if (fs.existsSync(frontendPath)) {
            fs.unlinkSync(frontendPath);
          }
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    

    this.copyToFrontend(file.filename);
    
    return this.productsService.update(id, { imageUrl });
  }

  @Patch(':id/inactive')
  @ApiOperation({ summary: 'Set product as inactive (Soft delete)' })
  @ApiResponse({ status: 200, description: 'Product successfully set as inactive' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  setInactive(@Param('id') id: string) {
    return this.productsService.setInactive(id);
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(@Param('id') id: string) {
   
    return { message: 'Order deleted successfully' };
  }
}