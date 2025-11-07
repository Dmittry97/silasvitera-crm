import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { PagesService } from './pages/pages.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  // Serve static files from public/photos
  app.useStaticAssets(join(__dirname, '..', 'public', 'photos'), {
    prefix: '/photos/',
  });
  
  // Initialize default pages
  const pagesService = app.get(PagesService);
  await pagesService.initializeDefaultPages();
  
  // Clean expired reservations every minute
  const productsService = app.get(ProductsService);
  setInterval(async () => {
    await productsService.cleanExpiredReservations();
  }, 60000); // 1 minute

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
