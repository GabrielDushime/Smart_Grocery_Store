import { Controller, Get, Param, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiResponse({ status: 200, description: 'Return all inventory items' })
  findAll(): Promise<Inventory[]> {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({ status: 200, description: 'Return inventory item by ID' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  findOne(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  @ApiResponse({ status: 200, description: 'Return inventory by product ID' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found' })
  findByProduct(@Param('productId') productId: string): Promise<Inventory> {
    return this.inventoryService.findByProduct(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({ status: 200, description: 'Return the updated inventory item' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  update(
    @Param('id') id: string, 
    @Body() updateInventoryDto: UpdateInventoryDto
  ): Promise<Inventory> {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Patch('product/:productId/updateStock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock quantity' })
  @ApiResponse({ status: 200, description: 'Return the updated inventory' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number
  ): Promise<Inventory> {
    return this.inventoryService.updateStock(productId, quantity);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize inventory records for all products' })
  @ApiResponse({ status: 200, description: 'Inventory records initialized successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async initializeInventory(): Promise<{ message: string }> {
    await this.inventoryService.initializeInventory();
    return { message: 'Inventory initialized successfully' };
  }


@Post('initialize/product/:productId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Initialize inventory record for a single product' })
@ApiResponse({ status: 200, description: 'Inventory record initialized successfully' })
@ApiResponse({ status: 404, description: 'Product not found' })
@ApiResponse({ status: 403, description: 'Forbidden' })
async initializeProductInventory(
  @Param('productId') productId: string
): Promise<Inventory> {
  return this.inventoryService.initializeProductInventory(productId);
}
}