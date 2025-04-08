// modules/analytics/dto/analytics-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SalesOverviewDto {
  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Sales by day' })
  salesByDay: Record<string, number>;
}

export class TopProductsDto {
  @ApiProperty({ description: 'Product ID' })
  id: number;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Quantity sold' })
  quantity: number;

  @ApiProperty({ description: 'Revenue generated' })
  revenue: number;
}

export class InventoryStatusDto {
  @ApiProperty({ description: 'Total number of inventory items' })
  totalItems: number;

  @ApiProperty({ description: 'Items with stock below threshold' })
  lowStockItems: Array<{
    id: number;
    name: string;
    quantity: number;
    threshold: number;
  }>;

  @ApiProperty({ description: 'Items out of stock' })
  outOfStockItems: Array<{
    id: number;
    name: string;
  }>;
}