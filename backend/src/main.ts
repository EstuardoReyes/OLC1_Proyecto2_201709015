import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir requests del frontend Angular (dev: 4200, prod: nginx)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:80', 'http://frontend'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend GoScript corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
