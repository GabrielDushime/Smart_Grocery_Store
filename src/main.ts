import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}



import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe,ClassSerializerInterceptor  } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors();
  
 
  app.setGlobalPrefix('api');
  
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  

  const config = new DocumentBuilder()
    .setTitle('Smart Grocery Store API')
    .setDescription('API documentation for Smart Grocery Store backend')
    .setVersion('1.0')
    .addTag('Health','Health check endpoint')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Inventory', 'Inventory management endpoints')
    .addTag('Checkout', 'Checkout process endpoints')
    .addTag('Analytics', 'Analytics and reporting endpoints')
    .addTag('Simulation', 'Simulation')
   
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
 
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available on: http://localhost:${port}/api/docs`);
}
bootstrap();