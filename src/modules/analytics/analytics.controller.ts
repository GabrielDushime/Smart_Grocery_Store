// modules/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales overview' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return sales overview data' })
  getSalesOverview(@Query('days') days: number = 7) {
    return this.analyticsService.getSalesOverview(days);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return top selling products' })
  getTopSellingProducts(@Query('limit') limit: number = 5) {
    return this.analyticsService.getTopSellingProducts(limit);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory status' })
  @ApiResponse({ status: 200, description: 'Return inventory status' })
  getInventoryStatus() {
    return this.analyticsService.getInventoryStatus();
  }

  @Get('thingspeak')
  @ApiOperation({ summary: 'Get ThingSpeak data' })
  @ApiResponse({ status: 200, description: 'Return ThingSpeak data' })
  getThingspeakData() {
    return this.analyticsService.getThingspeakData();
  }
}