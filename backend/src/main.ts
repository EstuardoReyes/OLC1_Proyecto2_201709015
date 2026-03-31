import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  // Permitir requests del frontend Angular (dev: 4200, prod: nginx)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:80', 'http://frontend'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
