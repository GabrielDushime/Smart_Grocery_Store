// src/modules/simulation/simulation.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Simulation')
@Controller('simulation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start IoT device simulation' })
  @ApiResponse({ status: 200, description: 'Simulation started successfully' })
  startSimulation() {
    return this.simulationService.startSimulation();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop IoT device simulation' })
  @ApiResponse({ status: 200, description: 'Simulation stopped successfully' })
  stopSimulation() {
    return this.simulationService.stopSimulation();
  }
 

  @Post('checkout')
@ApiOperation({ summary: 'Simulate a checkout process' })
@ApiResponse({ status: 200, description: 'Checkout simulation triggered' })
@ApiBody({
  schema: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'User ID (UUID) for the checkout simulation',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      numberOfItems: {
        type: 'number',
        description: 'Number of items to include in the checkout (default: 3)',
        example: 5
      }
    }
  }
})
simulateCheckout(@Body() body: { userId: string; numberOfItems?: number }) {
  // Add validation to check if body and userId exist
  if (!body || body.userId === undefined) {
    throw new Error('Missing required parameter: userId');
  }
  
  return this.simulationService.simulateCheckout(
    body.userId,
    body.numberOfItems || 3
  );
}


}