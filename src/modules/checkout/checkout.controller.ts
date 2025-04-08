import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CartItemDto } from './dto/cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('cart')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  addToCart(@Request() req, @Body() cartItemDto: CartItemDto) {
    return this.checkoutService.addToCart(req.user.id, cartItemDto);
  }

  @Get('cart')
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Return user cart items' })
  getUserCart(@Request() req) {
    return this.checkoutService.getUserCart(req.user.id);
  }

  @Delete('cart/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  removeFromCart(@Request() req, @Param('id') id: string) {
    return this.checkoutService.removeFromCart(req.user.id, id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Process checkout' })
  @ApiResponse({ status: 201, description: 'Checkout processed successfully' })
  checkout(@Request() req, @Body() checkoutDto: CheckoutDto) {
    return this.checkoutService.checkout(req.user.id, checkoutDto);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order directly' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
  return this.checkoutService.createOrder(createOrderDto);
  }
  
  @Get('orders')
  @ApiOperation({ summary: 'Get order history' })
  @ApiResponse({ status: 200, description: 'Return order history' })
  getOrderHistory(@Request() req) {
    return this.checkoutService.getOrderHistory(req.user.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Return order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderDetails(@Request() req, @Param('id') id: string) {
    return this.checkoutService.getOrderDetails(req.user.id, id);
  }
}